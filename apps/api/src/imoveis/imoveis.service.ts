import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, ilike, lte, inArray, sql } from 'drizzle-orm';

@Injectable()
export class ImoveisService {
  // Usamos 'any' no construtor para evitar o mismatch de versão do Drizzle entre pacotes
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. BUSCA PARA O PORTAL PÚBLICO (Filtros Avançados)
   */
  async buscarPortal(tenantId: string, query: any) {
    try {
      const table = schema.imoveis as any;
      const tableLink = schema.imoveisAtributos as any;

      let conds = [
        eq(table.tenant_id, tenantId),
        eq(table.status, 'disponivel'),
      ];

      if (query.tipo) conds.push(eq(table.tipo, query.tipo));
      if (query.cidade) conds.push(ilike(table.cidade, `%${query.cidade}%`));
      if (query.precoMax)
        conds.push(lte(table.preco_venda, query.precoMax.toString()));

      if (
        query.atributos &&
        Array.isArray(query.atributos) &&
        query.atributos.length > 0
      ) {
        const subQuery = this.db
          .select({ id: tableLink.imovel_id })
          .from(tableLink)
          .where(inArray(tableLink.atributo_id, query.atributos.map(Number)));

        conds.push(inArray(table.id, subQuery));
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (e: any) {
      console.error('❌ [SISMOB] Erro na busca do portal:', e.message);
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA COMPLETA (Para Edição)
   * Resolve o erro de Overload em midias e atributos
   */
  async findOne(id: number, tenantId: string) {
    try {
      const tableImoveis = schema.imoveis as any;
      const tableEnderecos = schema.enderecos as any;

      // BUSCA COM JOIN: Imóvel + Endereço
      const results = await this.db
        .select()
        .from(tableImoveis)
        .leftJoin(tableEnderecos, eq(tableEnderecos.imovel_id, tableImoveis.id))
        .where(
          and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
        )
        .limit(1);

      if (results.length === 0) return null;

      const row = results[0];
      return {
        ...row.imoveis,
        endereco: row.enderecos || { cep: '', logradouro: '' },
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * 3. MOTOR DE GRAVAÇÃO ATÔMICA (v1.60)
   */
  async upsert(dto: any, files: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        // 1. EXTRAÇÃO E LIMPEZA (Puxando o objeto 'endereco' do seu Mapa)
        const {
          id,
          atributos,
          midias,
          endereco, // Objeto {cep, logradouro, numero, bairro, cidade, estado}
          created_at,
          updated_at,
          ...limpo
        } = dto;

        const tableImoveis = schema.imoveis as any;
        const tableEnderecos = schema.enderecos as any;
        const tableLinkAtributos = schema.imoveisAtributos as any;
        const tableMidias = schema.midias as any;

        // 2. MONTAGEM DO PAYLOAD DO IMÓVEL (Master)
        // Mantemos uma cópia do endereço original aqui para busca rápida (Pilar Agilidade)
        const enderecoTexto = `${endereco?.logradouro || ''}, ${endereco?.numero || 'SN'} - ${endereco?.bairro || ''}`;

        const payloadImovel = {
          ...limpo,
          tenant_id: tenantId,
          endereco_original: enderecoTexto,
          tipo: limpo.tipo, // Resolve o erro 500 do campo 'tipo'
          unidade_id: limpo.unidade_id ? Number(limpo.unidade_id) : null,
          proprietario_id: limpo.proprietario_id || null,
          preco_venda: limpo.preco_venda ? limpo.preco_venda.toString() : '0',
          area_privativa: limpo.area_privativa
            ? limpo.area_privativa.toString()
            : '0',
          updated_at: new Date(),
        };

        let imovelId = id;

        // 3. PERSISTÊNCIA DO IMÓVEL (Gera o ID para as tabelas filhas)
        if (id && id !== 'undefined') {
          await tx
            .update(tableImoveis)
            .set(payloadImovel)
            .where(eq(tableImoveis.id, id));
        } else {
          const [novo] = await tx
            .insert(tableImoveis)
            .values(payloadImovel)
            .returning();
          imovelId = novo.id;
        }

        // 4. GRAVAÇÃO DO ENDEREÇO NA TABELA 'ENDERECOS' (O que você solicitou!)
        if (endereco && (endereco.cep || endereco.logradouro)) {
          console.log(
            `🏠 [SISMOB] Sincronizando endereço na tabela vinculada para o imóvel: ${imovelId}`,
          );

          // Limpa endereço anterior para não duplicar
          await tx
            .delete(tableEnderecos)
            .where(eq(tableEnderecos.imovel_id, imovelId));

          // Insere o novo vínculo
          await tx.insert(tableEnderecos).values({
            imovel_id: imovelId,
            cep: endereco.cep || '00000-000',
            logradouro: endereco.logradouro || 'Não informado',
            numero: endereco.numero || 'SN',
            bairro: endereco.bairro || 'Não informado',
            cidade: endereco.cidade || 'Não informado',
            estado: endereco.estado || '??',
          });
        }

        // 5. GRAVAÇÃO DO CARDÁPIO DE ATRIBUTOS (Relacional)
        if (atributos && Array.isArray(atributos)) {
          await tx
            .delete(tableLinkAtributos)
            .where(eq(tableLinkAtributos.imovel_id, imovelId));
          const insAttr = atributos.map((aid: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(aid),
          }));
          if (insAttr.length > 0)
            await tx.insert(tableLinkAtributos).values(insAttr);
        }

        // 6. GRAVAÇÃO DE MÍDIAS (Galeria)
        if (midias && Array.isArray(midias)) {
          await tx
            .delete(tableMidias)
            .where(eq(tableMidias.imovel_id, imovelId));
          const insMidias = midias.map((m: any, idx: number) => ({
            imovel_id: imovelId,
            url: m.url,
            tipo: m.tipo || 'foto_interna',
            is_capa: m.is_capa || idx === 0,
            ordem: idx,
          }));
          if (insMidias.length > 0)
            await tx.insert(tableMidias).values(insMidias);
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [SISMOB DB FATAL]:', e.message);
        throw new InternalServerErrorException(
          `Falha na gravação industrial: ${e.message}`,
        );
      }
    });
  }
  /**
   * 4. LISTAGEM DO GRID
   */
  async findAll(tenantId: string) {
    const table = schema.imoveis as any;
    return await this.db
      .select()
      .from(table)
      .where(eq(table.tenant_id, tenantId))
      .orderBy(desc(table.id));
  }

  /**
   * 5. EXCLUSÃO COM LIMPEZA
   */
  async remove(id: number, tenantId: string) {
    const tableImoveis = schema.imoveis as any;
    const tableMidias = schema.midias as any;
    const tableAttr = schema.imoveisAtributos as any;

    await this.db.delete(tableMidias).where(eq(tableMidias.imovel_id, id));
    await this.db.delete(tableAttr).where(eq(tableAttr.imovel_id, id));

    return await this.db
      .delete(tableImoveis)
      .where(
        and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
      );
  }
}
