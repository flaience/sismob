import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, ilike, and, lte, desc, inArray } from 'drizzle-orm';

@Injectable()
export class ImoveisService {
  // 1. CONSTRUTOR INDUSTRIAL (Bypass de versão do Drizzle)
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * LISTAGEM DO GRID (O que estava faltando e causou o erro)
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
   * BUSCA ÚNICA (Para Edição)
   */
  async findOne(id: number, tenantId: string) {
    try {
      const table = schema.imoveis as any;
      const tableMidias = schema.midias as any;
      const tableAttr = schema.imoveisAtributos as any;

      // 1. BUSCA O IMÓVEL (Master)
      const results = await this.db
        .select()
        .from(table)
        .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
        .limit(1);

      if (results.length === 0) return null;
      const imovel = results[0];

      // 2. BUSCA AS MÍDIAS (Fotos e 360)
      const midias = await this.db
        .select()
        .from(tableMidias)
        .where(eq(tableMidias.imovel_id, id));

      // 3. BUSCA OS ATRIBUTOS (Pega apenas os IDs para o Cardápio)
      const atributosMarcados = await this.db
        .select({ id: tableAttr.atributo_id })
        .from(tableAttr)
        .where(eq(tableAttr.imovel_id, id));

      // 4. MONTAGEM DO OBJETO COMPLETO PARA O FORMULÁRIO
      return {
        ...imovel,
        midias: midias || [],
        // Transforma a lista de objetos em um vetor simples de IDs [1, 5, 8]
        atributos: atributosMarcados.map((a: any) => a.id),
      };
    } catch (e: any) {
      console.error('❌ [SISMOB] Erro ao carregar imóvel completo:', e.message);
      return null;
    }
  }
  /**
   * MOTOR DE GRAVAÇÃO ATÔMICA (Imóvel + Atributos + Endereço)
   */
  async upsert(dto: any, files: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const {
          id,
          atributos,
          midias,
          endereco,
          created_at,
          updated_at,
          ...dadosRestantes
        } = dto;

        // 1. CASTING DE TABELAS (Bypass de tipagem industrial)
        const tableImoveis = schema.imoveis as any;
        const tableMidias = schema.midias as any;
        const tableAtributos = schema.imoveisAtributos as any;

        // 2. CONSTRUÇÃO DO ENDEREÇO (Para o banco não dar erro 500)
        const endStr = `${endereco?.logradouro || ''}, ${endereco?.numero || 'SN'} - ${endereco?.bairro || ''}, ${endereco?.cidade || ''}`;

        const payload = {
          ...dadosRestantes,
          ...endereco, // Espalha cidade, bairro, logradouro na raiz
          endereco_original: endStr,
          tenant_id: tenantId,
          updated_at: new Date(),
        };

        let imovelId = id;

        // 3. GRAVAÇÃO DO IMÓVEL (Master)
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

        // 4. GRAVAÇÃO DE ATRIBUTOS (O seu Cardápio)
        if (atributos && Array.isArray(atributos)) {
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));
          const insertsAttr = atributos.map((aid: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(aid),
          }));
          if (insertsAttr.length > 0)
            await tx.insert(tableAtributos).values(insertsAttr);
        }

        // 5. GRAVAÇÃO DE MÍDIAS (CORREÇÃO DO PLURAL)
        if (midias && Array.isArray(midias)) {
          // Limpa rastro anterior
          await tx
            .delete(tableMidias)
            .where(eq(tableMidias.imovel_id, imovelId));

          const insertsMidia = midias.map((m: any, idx: number) => ({
            imovel_id: imovelId,
            url: m.url,
            tipo: m.tipo || 'foto_interna',
            is_capa: m.is_capa || idx === 0,
          }));

          // O TIRO DE MISERICÓRDIA NO ERRO: 'tableMidias' com S no final
          if (insertsMidia.length > 0)
            await tx.insert(tableMidias).values(insertsMidia);
        }

        console.log(`✅ [SISMOB] Imóvel #${imovelId} persistido com sucesso.`);
        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [DB ERROR]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  async buscarPortal(tenantId: string, query: any) {
    const table = schema.imoveis as any;
    const tableLink = schema.imoveisAtributos as any;

    // 1. Filtros básicos
    let conds = [eq(table.tenant_id, tenantId), eq(table.status, 'disponivel')];

    if (query.tipo) conds.push(eq(table.tipo, query.tipo));
    if (query.cidade) conds.push(ilike(table.cidade, `%${query.cidade}%`));
    if (query.precoMax)
      conds.push(lte(table.preco_venda, query.precoMax.toString()));

    // 2. FILTRO POR ATRIBUTOS (A MÁGICA)
    // Busca apenas imóveis que possuam os IDs de atributos selecionados
    if (
      query.atributos &&
      Array.isArray(query.atributos) &&
      query.atributos.length > 0
    ) {
      const subQuery = this.db
        .select({ imovelId: tableLink.imovel_id })
        .from(tableLink)
        .where(inArray(tableLink.atributo_id, query.atributos.map(Number)));

      conds.push(inArray(table.id, subQuery));
    }

    return await this.db
      .select()
      .from(table)
      .where(and(...conds));
  }
  /**
   * EXCLUSÃO COM LIMPEZA DE RASTRO
   */
  async remove(id: number, tenantId: string) {
    const tableImoveis = schema.imoveis as any;
    const tableMidias = schema.midias as any;
    const tableAtributos = schema.imoveisAtributos as any;

    await this.db.delete(tableMidias).where(eq(tableMidias.imovel_id, id));
    await this.db
      .delete(tableAtributos)
      .where(eq(tableAtributos.imovel_id, id));

    return await this.db
      .delete(tableImoveis)
      .where(
        and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
      );
  }
}
