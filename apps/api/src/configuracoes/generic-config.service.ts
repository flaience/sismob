import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class GenericConfigService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async findAll(tableName: string, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      if (!table) return [];

      console.log(
        `📡 [SISMOB] Buscando ${tableName} para o Tenant: ${tenantId}`,
      );

      const results = await this.db
        .select()
        .from(table)
        .where(eq(table.tenant_id, tenantId)); // <--- GARANTE O FILTRO

      return results;
    } catch (e) {
      console.error(`❌ Erro ao buscar ${tableName}:`, e.message);
      return [];
    }
  }
  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      const { id, created_at, updated_at, ...data } = dto;

      const payload = {
        ...data,
        tenant_id: tenantId,
        // Garante que a quantidade seja gravada como número real
        ...(data.quantidade ? { quantidade: Number(data.quantidade) } : {}),
      };

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        // RETURNING() blindado com as any
        return await (this.db.insert(table).values(payload).returning() as any);
      }
    } catch (e: any) {
      console.error(`❌ Erro na tabela ${tableName}:`, e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(tableName: string, id: number, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
