import {
  Injectable,
  Inject,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike, or } from 'drizzle-orm';

@Injectable()
export class GenericService {
  constructor(
    @Inject('DRIZZLE_CONNECTION') private db: PostgresJsDatabase<typeof schema>,
  ) {}

  private async assertTenantCanOperate(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant não informado.');
    }

    const tenantsTable = (schema as any).tenants;

    const result = await this.db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.id, tenantId))
      .limit(1);

    const tenant = result[0];

    if (!tenant) {
      throw new ForbiddenException('Tenant não encontrado.');
    }

    const status = String(tenant.status ?? 'trial').toLowerCase();

    if (status === 'suspenso') {
      throw new ForbiddenException(
        'Tenant suspenso. Operações de criação, edição e exclusão estão bloqueadas.',
      );
    }
  }

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

      if (search) {
        const searchConds = [];

        if (table.nome) searchConds.push(ilike(table.nome, `%${search}%`));
        if (table.descricao) {
          searchConds.push(ilike(table.descricao, `%${search}%`));
        }

        if (searchConds.length > 0) {
          conds.push(or(...searchConds) as any);
        }
      }

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
      await this.assertTenantCanOperate(tenantId);

      const table = (schema as any)[tableName];
      if (!table) throw new Error(`Tabela ${tableName} não mapeada no Schema.`);

      const isUpdate = !!dto.id;

      const { id, imobiliariaId, ...data } = dto;

      const payload: any = {
        ...data,
        tenant_id: tenantId,
      };

      if (table.updated_at) {
        payload.updated_at = new Date();
      }

      if (isUpdate) {
        return await this.db
          .update(table)
          .set(payload)
          .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
          .returning();
      }

      return await this.db.insert(table).values(payload).returning();
    } catch (e) {
      if (e instanceof ForbiddenException || e instanceof BadRequestException) {
        throw e;
      }

      throw new InternalServerErrorException(
        `Erro ao salvar ${tableName}: ${e.message}`,
      );
    }
  }

  async remove(tableName: string, id: number, tenantId: string) {
    try {
      await this.assertTenantCanOperate(tenantId);

      const table = (schema as any)[tableName];
      if (!table) throw new Error(`Tabela ${tableName} não mapeada no Schema.`);

      return await this.db
        .delete(table)
        .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
        .returning();
    } catch (e) {
      if (e instanceof ForbiddenException || e instanceof BadRequestException) {
        throw e;
      }

      throw new InternalServerErrorException(
        `Erro ao excluir ${tableName}: ${e.message}`,
      );
    }
  }
}
