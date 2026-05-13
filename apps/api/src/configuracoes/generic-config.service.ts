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
      return await this.db
        .select()
        .from(table)
        .where(eq(table.tenant_id, tenantId));
    } catch (e) {
      return [];
    }
  }

  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      const { id, created_at, updated_at, ...data } = dto;

      // HIGIENIZAÇÃO INDUSTRIAL
      const payload = {
        ...data,
        tenant_id: tenantId,
        // Se for a tabela de atributos, força a quantidade a ser número
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
      console.error(
        `❌ Erro de persistência na tabela ${tableName}:`,
        e.message,
      );
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
