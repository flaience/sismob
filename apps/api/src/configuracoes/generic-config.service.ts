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

      // SEGREDO INDUSTRIAL: Verifica se a tabela tem a coluna tenant_id
      // Se não tiver (como era o caso do atributos), ele não tenta filtrar e não dá erro de sintaxe
      if (!table.tenant_id) {
        console.error(
          `❌ [SISMOB] A tabela ${tableName} está sem a coluna tenant_id no Schema!`,
        );
        return this.db.select().from(table); // Busca sem filtro apenas para teste
      }

      return await this.db
        .select()
        .from(table)
        .where(eq(table.tenant_id, tenantId));
    } catch (e: any) {
      console.error(
        `❌ [SISMOB ERROR] Erro na busca da tabela ${tableName}:`,
        e.message,
      );
      return [];
    }
  }
  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const table = (schema as any)[tableName];

      if (!table) {
        throw new InternalServerErrorException(
          `Tabela ${tableName} não localizada.`,
        );
      }

      // 1. LIMPEZA E MAPEAMENTO (O TIRO DE MISERICÓRDIA NO ERRO 500)
      const { id, created_at, updated_at, ...data } = dto;

      const payload = {
        ...data,
        tenant_id: tenantId, // <--- GARANTE QUE O ID DA IMOBILIÁRIA SEJA GRAVADO
        // Se for a tabela de atributos, garante que os IDs e Números sejam Inteiros
        ...(tableName === 'atributos'
          ? {
              quantidade: Number(data.quantidade || 1),
              categoria_id: Number(data.categoria_id),
            }
          : {}),
      };

      if (id && id !== 'undefined') {
        // UPDATE
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        // INSERT (O as any aqui evita erros de tipagem no build)
        return await (this.db.insert(table).values(payload).returning() as any);
      }
    } catch (e: any) {
      console.error(
        `❌ [SISMOB] Erro de persistência na tabela ${tableName}:`,
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
