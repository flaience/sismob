import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';

@Injectable()
export class GenericService {
  constructor(
    @Inject('DRIZZLE_CONNECTION') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(tableName: string, imobiliariaId: string, search?: string) {
    const table = (schema as any)[tableName];
    let conds = [eq(table.tenant_id, imobiliariaId)];

    // Se a tabela tiver campo 'nome' ou 'descricao', habilita busca
    if (search && table.nome) conds.push(ilike(table.nome, `%${search}%`));

    return await this.db
      .select()
      .from(table)
      .where(and(...conds));
  }

  async upsert(tableName: string, dto: any, imobiliariaId: string) {
    const table = (schema as any)[tableName];
    const isUpdate = !!dto.id;
    const payload = { ...dto, tenant_id: imobiliariaId };

    if (isUpdate) {
      return await this.db
        .update(table)
        .set(payload)
        .where(eq(table.id, dto.id));
    } else {
      return await this.db.insert(table).values(payload).returning();
    }
  }

  async remove(tableName: string, id: number, imobiliariaId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, imobiliariaId)));
  }
}
