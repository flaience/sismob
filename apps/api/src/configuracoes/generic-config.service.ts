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
    // 1. PROVA DE VIDA NO LOG (VEJA ISSO NO RAILWAY)
    console.log(`🚀 [SISMOB v225] Tabela: ${tableName} | Tenant: ${tenantId}`);

    try {
      const table = (schema as any)[tableName];
      if (!table) throw new Error(`Tabela ${tableName} inexistente.`);

      // 2. EXTRAÇÃO MANUAL (Garante que nada 'suje' o tenant_id)
      const { id, created_at, updated_at, imobiliariaId, tenant_id, ...limpo } =
        dto;

      const payload = {
        ...limpo,
        tenant_id: tenantId, // <--- INJEÇÃO FORÇADA
        updated_at: new Date(),
      };

      // 3. TRATAMENTO DE NÚMEROS (Garante que o banco aceite)
      if (tableName === 'atributos') {
        payload.quantidade = Number(dto.quantidade || 1);
        payload.categoria_id = dto.categoria_id
          ? Number(dto.categoria_id)
          : null;
      }

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        // 4. INSERT EXPLICITAMENTE PASSANDO O PAYLOAD
        const [novo] = await (this.db
          .insert(table)
          .values(payload)
          .returning() as any);
        return novo;
      }
    } catch (e: any) {
      console.error(`❌ [DB FATAL v225] Erro:`, e.message);
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
