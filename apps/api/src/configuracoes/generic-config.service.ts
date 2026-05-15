import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, sql, and } from 'drizzle-orm';

@Injectable()
export class GenericConfigService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. GRAVAÇÃO NUCLEAR (Bypass total de Schema)
   */
  async upsert(tableName: string, dto: any, tenantId: string) {
    console.log(`🔥 [SISMOB v240] MODO NUCLEAR ATIVO | Tabela: ${tableName}`);

    try {
      const { id, created_at, updated_at, imobiliariaId, ...dadosPuros } = dto;

      // SE FOR INSERÇÃO, USAMOS SQL PURO PARA O DRIZZLE NÃO APAGAR O TENANT_ID
      if (!id || id === 'undefined') {
        if (tableName === 'atributos') {
          return await this.db.execute(sql`
            INSERT INTO atributos (nome, quantidade, categoria_id, tenant_id, updated_at)
            VALUES (${dadosPuros.nome}, ${Number(dadosPuros.quantidade || 1)}, ${Number(dadosPuros.categoria_id)}, ${tenantId}, NOW())
            RETURNING *;
          `);
        }

        // Inserção genérica para outras tabelas usando SQL de Strings
        const table = (schema as any)[tableName];
        return await (this.db
          .insert(table)
          .values({ ...dadosPuros, tenant_id: tenantId })
          .returning() as any);
      }

      // UPDATE (Usa o padrão)
      const table = (schema as any)[tableName];
      return await this.db
        .update(table)
        .set({ ...dadosPuros, tenant_id: tenantId })
        .where(eq(table.id, id));
    } catch (e: any) {
      console.error(`❌ [DB FATAL v240]:`, e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * 2. LISTAGEM RESILIENTE (Resolve o erro do 'where = $1')
   */
  async findAll(tableName: string, tenantId: string) {
    try {
      console.log(`📡 [SISMOB v240] Listando ${tableName} para ${tenantId}`);

      // USAMOS SQL PURO NO WHERE PARA FORÇAR A COLUNA TENANT_ID
      return await this.db
        .select()
        .from((schema as any)[tableName])
        .where(sql`tenant_id = ${tenantId}`); // <--- O SEGREDO DA VITÓRIA
    } catch (e: any) {
      console.error(`❌ [SISMOB v240] Erro ao listar:`, e.message);
      return [];
    }
  }

  async remove(tableName: string, id: number, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), sql`tenant_id = ${tenantId}`));
  }
}
