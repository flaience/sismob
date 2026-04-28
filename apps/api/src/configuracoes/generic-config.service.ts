// src/configuracoes/generic-config.service.ts
import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';

@Injectable()
export class GenericConfigService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Busca todos os registros da tabela filtrando pela Imobiliária (SaaS)
  async findAll(tableName: string, tenantId: string, search?: string) {
    try {
      const table = (schema as any)[tableName];
      const conds = [eq(table.tenant_id, tenantId)];

      if (search && table.nome) {
        conds.push(ilike(table.nome, `%${search}%`));
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (e) {
      console.error(`❌ Erro ao listar ${tableName}:`, e.message);
      return [];
    }
  }

  // Salva ou Atualiza (Upsert)
  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      const { id, ...data } = dto;
      const payload = { ...data, tenant_id: tenantId };

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        return await this.db.insert(table).values(payload).returning();
      }
    } catch (e) {
      throw new InternalServerErrorException(
        `Erro ao salvar em ${tableName}: ${e.message}`,
      );
    }
  }

  // Remove registro
  async remove(tableName: string, id: number, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
