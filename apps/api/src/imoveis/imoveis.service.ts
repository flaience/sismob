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
        const {
          id,
          atributos,
          midias,
          endereco,
          created_at,
          updated_at,
          ...limpo
        } = dto;
        const table = schema.imoveis as any;
        const tableLink = schema.imoveisAtributos as any;

        const rua = endereco?.logradouro || limpo.logradouro || '';
        const num = endereco?.numero || limpo.numero || 'SN';
        const bairro = endereco?.bairro || limpo.bairro || '';

        const payload = {
          ...limpo,
          ...endereco,
          tenant_id: tenantId,
          endereco_original: `${rua}, ${num} - ${bairro}`,
          unidade_id: limpo.unidade_id ? Number(limpo.unidade_id) : null,
          preco_venda: limpo.preco_venda?.toString() || '0',
          area_privativa: limpo.area_privativa?.toString() || '0',
          updated_at: new Date(),
        };

        let imovelId = id;
        if (id && id !== 'undefined') {
          await tx.update(table).set(payload).where(eq(table.id, id));
        } else {
          const [novo] = await tx.insert(table).values(payload).returning();
          imovelId = novo.id;
        }

        if (atributos && Array.isArray(atributos)) {
          await tx.delete(tableLink).where(eq(tableLink.imovel_id, imovelId));
          const ins = atributos.map((aid: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(aid),
          }));
          if (ins.length > 0) await tx.insert(tableLink).values(ins);
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [SISMOB] Falha na gravação do imóvel:', e.message);
        throw new InternalServerErrorException(e.message);
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
