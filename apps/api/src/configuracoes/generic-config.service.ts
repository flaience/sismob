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
    // 1. DIAGNÓSTICO DE FRONTEIRA: Veja isso no log do Railway!
    console.log(
      `🏭 [SISMOB FACTORY] Tabela: ${tableName} | ID Imobiliária: ${tenantId}`,
    );

    if (!tenantId || tenantId === 'undefined' || tenantId === 'null') {
      throw new InternalServerErrorException(
        `🚨 ERRO: O tenantId chegou vazio no Service. A gravação foi abortada para evitar erro 500.`,
      );
    }

    try {
      const table = (schema as any)[tableName];
      const { id, created_at, updated_at, imobiliariaId, ...dadosRestantes } =
        dto;

      // 2. MONTAGEM DO PAYLOAD (A ordem aqui é vital!)
      const payload: any = {
        ...dadosRestantes, // Dados do formulário
      };

      // 3. SOBREPOSIÇÃO ABSOLUTA: Garantimos que o ID do Luis seja o dono do registro
      payload.tenant_id = tenantId;

      if (tableName === 'atributos') {
        payload.quantidade = Number(dto.quantidade || 1);
        payload.categoria_id = dto.categoria_id
          ? Number(dto.categoria_id)
          : null;
      }

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        // 4. INSERT BLINDADO
        const [novo] = await (this.db
          .insert(table)
          .values(payload)
          .returning() as any);
        return novo;
      }
    } catch (e: any) {
      console.error(`❌ [DB FATAL ERROR] Na tabela ${tableName}:`, e.message);
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
