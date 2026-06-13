import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, ilike, lte, inArray, sql } from 'drizzle-orm';
import {
  persistirEnderecoLego,
  removerEnderecoLego,
} from '../common/utils/address-factory';

@Injectable()
export class ImoveisService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. BUSCA PARA O PORTAL
   */
  async buscarPortal(tenantId: string, query: any) {
    try {
      const i = schema.imoveis as any;
      const e = schema.enderecos as any;
      const tableLink = schema.imoveisAtributos as any;

      let conds = [eq(i.tenant_id, tenantId), eq(i.status, 'disponivel')];
      if (query.tipo) conds.push(eq(i.tipo, query.tipo));
      if (query.precoMax)
        conds.push(lte(i.preco_venda, query.precoMax.toString()));
      if (query.cidade) conds.push(ilike(e.cidade, `%${query.cidade}%`));

      if (
        query.atributos &&
        Array.isArray(query.atributos) &&
        query.atributos.length > 0
      ) {
        const subQuery = this.db
          .select({ id: tableLink.imovel_id })
          .from(tableLink)
          .where(inArray(tableLink.atributo_id, query.atributos.map(Number)));
        conds.push(inArray(i.id, subQuery));
      }

      return await this.db
        .select()
        .from(i)
        .leftJoin(e, eq(i.endereco_id, e.id))
        .where(and(...conds));
    } catch (e: any) {
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA (Edição)
   * SOLUÇÃO: Tabelas detalhe como 'any' para evitar Overload Error
   */
  async findOne(id: number, tenantId: string) {
    try {
      const iTable = schema.imoveis as any;
      const eTable = schema.enderecos as any;
      const mTable = schema.midias as any; // <--- ESCUDO AQUI
      const aTable = schema.imoveisAtributos as any; // <--- ESCUDO AQUI

      const res = await this.db
        .select()
        .from(iTable)
        .leftJoin(eTable, eq(iTable.endereco_id, eTable.id))
        .where(and(eq(iTable.id, id), eq(iTable.tenant_id, tenantId)))
        .limit(1);

      if (!res[0]) return null;

      // Consultas de detalhe usando as tabelas blindadas
      const midias = await this.db
        .select()
        .from(mTable)
        .where(eq(mTable.imovel_id, id));
      const atributos = await this.db
        .select()
        .from(aTable)
        .where(eq(aTable.imovel_id, id));

      return {
        ...res[0].imoveis,
        endereco: res[0].enderecos,
        midias: midias || [],
        atributos: atributos.map((a: any) => a.atributo_id),
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * 3. MOTOR DE UPSERT
   */
  async upsert(dto: any, files: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const { id, endereco, ...dados } = dto;
        const iTable = schema.imoveis as any;
        const endId = await persistirEnderecoLego(
          tx,
          endereco,
          dto.endereco_id,
        );

        const payload = {
          ...dados,
          tenant_id: tenantId,
          endereco_id: endId,
          updated_at: new Date(),
        };

        if (id && id !== 'undefined') {
          await tx.update(iTable).set(payload).where(eq(iTable.id, id));
          return { id, success: true };
        } else {
          const [novo] = await tx.insert(iTable).values(payload).returning();
          return { id: novo.id, success: true };
        }
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  /**
   * 4. LISTAGEM DO GRID
   */
  async findAll(tenantId: string) {
    const i = schema.imoveis as any;
    return await this.db
      .select()
      .from(i)
      .where(eq(i.tenant_id, tenantId))
      .orderBy(desc(i.id));
  }

  /**
   * 5. EXCLUSÃO REAL ( v1.60 Blindada)
   */
  async remove(id: number, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      const iTable = schema.imoveis as any;
      const mTable = schema.midias as any;
      const aTable = schema.imoveisAtributos as any;

      const [reg] = await tx.select().from(iTable).where(eq(iTable.id, id));

      // Limpeza de dependências usando tabelas blindadas
      await tx.delete(mTable).where(eq(mTable.imovel_id, id));
      await tx.delete(aTable).where(eq(aTable.imovel_id, id));

      if (reg?.endereco_id) await removerEnderecoLego(tx, reg.endereco_id);

      return await tx.delete(iTable).where(eq(iTable.id, id));
    });
  }
}
