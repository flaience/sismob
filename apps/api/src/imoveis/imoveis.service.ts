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
      const tableMidias = schema.midias as any;
      const tableAttr = schema.imoveisAtributos as any;

      // A. Busca o Imóvel
      const results = await this.db
        .select()
        .from(tableImoveis)
        .where(
          and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
        )
        .limit(1);

      const row = results[0];
      if (!row) return null;

      // B. Busca Mídias (O erro morre aqui)
      const midias = await this.db
        .select()
        .from(tableMidias)
        .where(eq(tableMidias.imovel_id, id));

      // C. Busca Atributos (O erro morre aqui)
      const atributos = await this.db
        .select()
        .from(tableAttr)
        .where(eq(tableAttr.imovel_id, id));

      return {
        ...row,
        midias: midias || [],
        atributos: atributos.map((a: any) => a.atributo_id),
        endereco: {
          cep: row.cep || '',
          logradouro: row.logradouro || '',
          numero: row.numero || '',
          bairro: row.bairro || '',
          cidade: row.cidade || '',
          estado: row.estado || '',
        },
      };
    } catch (e: any) {
      console.error(
        '❌ [SISMOB] Erro ao carregar detalhe do imóvel:',
        e.message,
      );
      return null;
    }
  }

  /**
   * 3. MOTOR DE GRAVAÇÃO ATÔMICA (v1.60)
   */
  async upsert(dto: any, files: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        // 1. EXTRAÇÃO E LIMPEZA
        const {
          id,
          atributos,
          midias, // Array de objetos {url, tipo, is_capa}
          endereco, // Objeto vindo da SECAO_ENDERECO {logradouro, numero, etc}
          created_at,
          updated_at,
          ...limpo
        } = dto;

        const tableImoveis = schema.imoveis as any;
        const tableLinkAtributos = schema.imoveisAtributos as any;
        const tableMidias = schema.midias as any;

        // 2. MONTAGEM DO PAYLOAD (Aplainando o endereço para a raiz da tabela)
        const payload = {
          ...limpo,
          tenant_id: tenantId,
          // Mapeia os campos do objeto 'endereco' para as colunas da tabela
          cep: endereco?.cep || limpo.cep || '',
          logradouro: endereco?.logradouro || limpo.logradouro || '',
          numero: endereco?.numero || limpo.numero || 'SN',
          bairro: endereco?.bairro || limpo.bairro || '',
          cidade: endereco?.cidade || limpo.cidade || '',
          estado: endereco?.estado || limpo.estado || '',
          // Campo obrigatório que une tudo
          endereco_original: `${endereco?.logradouro || limpo.logradouro || ''}, ${endereco?.numero || 'SN'} - ${endereco?.bairro || ''}`,

          // Conversão de valores técnicos
          unidade_id: limpo.unidade_id ? Number(limpo.unidade_id) : null,
          preco_venda: limpo.preco_venda ? limpo.preco_venda.toString() : '0',
          area_privativa: limpo.area_privativa
            ? limpo.area_privativa.toString()
            : '0',
          updated_at: new Date(),
        };

        let imovelId = id;

        // 3. SALVA O IMÓVEL (Master)
        if (id && id !== 'undefined') {
          await tx
            .update(tableImoveis)
            .set(payload)
            .where(eq(tableImoveis.id, id));
        } else {
          const [novo] = await tx
            .insert(tableImoveis)
            .values(payload)
            .returning();
          imovelId = novo.id;
        }

        // 4. GRAVAÇÃO DO CARDÁPIO DE ATRIBUTOS (Relacional)
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

        // 5. GRAVAÇÃO DE MÍDIAS (O que faltava no seu código!)
        if (midias && Array.isArray(midias)) {
          // Limpa mídias antigas para não duplicar na edição
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
          `Falha industrial: ${e.message}`,
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
