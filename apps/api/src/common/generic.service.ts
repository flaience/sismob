import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike, or } from 'drizzle-orm';

@Injectable()
export class GenericService {
  constructor(
    @Inject('DRIZZLE_CONNECTION') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * BUSCA INDUSTRIAL: Aceita busca textual E filtros específicos (ex: papel, status)
   */
  async findAll(
    tableName: string,
    tenantId: string,
    search?: string,
    filters?: any,
  ) {
    try {
      const table = (schema as any)[tableName];
      if (!table) throw new Error(`Tabela ${tableName} não mapeada no Schema.`);

      let conds = [eq(table.tenant_id, tenantId)];

      // 1. Busca Textual (Nome ou Descrição)
      if (search) {
        const searchConds = [];
        if (table.nome) searchConds.push(ilike(table.nome, `%${search}%`));
        if (table.descricao)
          searchConds.push(ilike(table.descricao, `%${search}%`));

        if (searchConds.length > 0) conds.push(or(...searchConds) as any);
      }

      // 2. Filtros Dinâmicos (Ex: papel: '3' para proprietários)
      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (
            table[key] &&
            filters[key] !== undefined &&
            key !== 'imobiliariaId' &&
            key !== 'search'
          ) {
            conds.push(eq(table[key], filters[key]));
          }
        });
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (e) {
      throw new InternalServerErrorException(
        `Erro ao listar ${tableName}: ${e.message}`,
      );
    }
  }

  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      const isUpdate = !!dto.id;

      // Sanitização: Remove o ID do payload de insert e garante o tenant_id
      const { id, ...data } = dto;
      const payload = {
        ...data,
        tenant_id: tenantId,
        updated_at: new Date(), // Auditoria para o RAG
      };

      if (isUpdate) {
        return await this.db
          .update(table)
          .set(payload)
          .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
      } else {
        return await this.db.insert(table).values(payload).returning();
      }
    } catch (e) {
      throw new InternalServerErrorException(
        `Erro ao salvar ${tableName}: ${e.message}`,
      );
    }
  }

  async remove(tableName: string, id: number, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
