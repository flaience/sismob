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
      //tableName aqui será 'categoriasAtributos' (vinda do Controller)
      const table = (schema as any)[tableName];

      if (!table) {
        throw new InternalServerErrorException(
          `A constante '${tableName}' não foi encontrada no arquivo schema.ts`,
        );
      }

      const { id, created_at, updated_at, ...data } = dto;
      const payload = {
        ...data,
        tenant_id: tenantId,
        ...(tableName === 'atributos'
          ? { quantidade: Number(data.quantidade || 1) }
          : {}),
      };

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        return await this.db.insert(table).values(payload).returning();
      }
    } catch (e: any) {
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
