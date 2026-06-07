import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, ilike, lte, inArray } from 'drizzle-orm';

@Injectable()
export class ImoveisService {
  // Usamos 'any' no construtor para evitar o mismatch de versão do Drizzle
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. BUSCA PARA O PORTAL (O que causou o erro de build)
   * Filtra por Cidade, Tipo, Preço e Cardápio de Atributos
   */
  async buscarPortal(tenantId: string, query: any) {
    try {
      const table = schema.imoveis as any;
      const tableLink = schema.imoveisAtributos as any;

      // Filtros básicos de visibilidade
      let conds = [
        eq(table.tenant_id, tenantId),
        eq(table.status, 'disponivel'),
      ];

      if (query.tipo) conds.push(eq(table.tipo, query.tipo));
      if (query.cidade) conds.push(ilike(table.cidade, `%${query.cidade}%`));
      if (query.precoMax)
        conds.push(lte(table.preco_venda, query.precoMax.toString()));

      // Filtro avançado por Atributos (Cardápio)
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
   * 2. BUSCA ÚNICA COMPLETA (Edição)
   */
  async findOne(id: number, tenantId: string) {
    try {
      const tableImoveis = schema.imoveis as any;
      const tableMidias = schema.midias as any;
      const tableAtributos = schema.imoveisAtributos as any;

      const results = await this.db
        .select()
        .from(tableImoveis)
        .where(
          and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
        )
        .limit(1);

      if (results.length === 0) return null;
      const imovel = results[0];

      const midias = await this.db
        .select()
        .from(tableMidias)
        .where(eq(tableMidias.imovel_id, id));
      const atributos = await this.db
        .select()
        .from(tableAtributos)
        .where(eq(tableAtributos.imovel_id, id));

      return {
        ...imovel,
        midias: midias || [],
        atributos: atributos.map((a: any) => a.atributo_id),
      };
    } catch (e: any) {
      return null;
    }
  }

  /**
   * 3. MOTOR DE UPSERT ATÔMICO
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
        const tableImoveis = schema.imoveis as any;
        const tableMidias = schema.midias as any;
        const tableAtributos = schema.imoveisAtributos as any;

        // Sincronia de Endereço Raiz
        const rua = endereco?.logradouro || dadosRestantes.logradouro || '';
        const num = endereco?.numero || dadosRestantes.numero || 'SN';
        const bairro = endereco?.bairro || dadosRestantes.bairro || '';
        const cidade = endereco?.cidade || dadosRestantes.cidade || '';
        const endStr = `${rua}, ${num} - ${bairro}, ${cidade}`;

        const payload = {
          ...dadosRestantes,
          ...endereco,
          endereco_original: endStr,
          tenant_id: tenantId,
          updated_at: new Date(),
        };

        let imovelId = id;
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

        if (atributos) {
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));
          const insAttr = atributos.map((aid: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(aid),
          }));
          if (insAttr.length > 0)
            await tx.insert(tableAtributos).values(insAttr);
        }

        if (midias) {
          await tx
            .delete(tableMidias)
            .where(eq(tableMidias.imovel_id, imovelId));
          const insMid = midias.map((m: any) => ({
            imovel_id: imovelId,
            url: m.url,
            tipo: m.tipo,
            is_capa: m.is_capa,
          }));
          if (insMid.length > 0) await tx.insert(tableMidias).values(insMid);
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  /**
   * 4. LISTAGEM INDUSTRIAL (Grid)
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
   * 5. EXCLUSÃO REAL
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
