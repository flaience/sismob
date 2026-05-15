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
    console.log(`🔥 [SISMOB v245] Gravando em: ${tableName} | ID: ${dto.id}`);

    try {
      const { id, created_at, updated_at, imobiliariaId, ...limpo } = dto;

      // INSERÇÃO NUCLEAR (Atributos)
      if (tableName === 'atributos' && (!id || id === 'undefined')) {
        return await this.db.execute(sql`
          INSERT INTO atributos (nome, quantidade, categoria_id, tenant_id, updated_at)
          VALUES (${limpo.nome}, ${Number(limpo.quantidade || 1)}, ${Number(limpo.categoria_id)}, ${tenantId}, NOW())
          RETURNING *;
        `);
      }

      // UPDATE NUCLEAR (Garante que a alteração funcione e salve a quantidade)
      if (id && id !== 'undefined') {
        if (tableName === 'atributos') {
          return await this.db.execute(sql`
            UPDATE atributos 
            SET nome = ${limpo.nome}, quantidade = ${Number(limpo.quantidade)}, 
                categoria_id = ${Number(limpo.categoria_id)}, updated_at = NOW()
            WHERE id = ${Number(id)} AND tenant_id = ${tenantId}
          `);
        }
        // Update genérico para outras tabelas
        const table = (schema as any)[tableName];
        return await this.db
          .update(table)
          .set({ ...limpo, tenant_id: tenantId })
          .where(eq(table.id, id));
      }

      // Insert genérico para outras tabelas
      const table = (schema as any)[tableName];
      return await (this.db
        .insert(table)
        .values({ ...limpo, tenant_id: tenantId })
        .returning() as any);
    } catch (e: any) {
      console.error(`❌ [DB FATAL v245]:`, e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * 2. LISTAGEM NUCLEAR (Resolve o erro da quantidade sumida no Grid)
   */
  async findAll(tableName: string, tenantId: string) {
    try {
      console.log(`📡 [SISMOB v245] Buscando TUDO de ${tableName}`);

      // O TIRO DE MISERICÓRDIA: Usamos SQL puro para o Drizzle não filtrar colunas "desconhecidas"
      const res = await this.db.execute(sql`
        SELECT * FROM ${sql.raw(tableName)} WHERE tenant_id = ${tenantId} ORDER BY id DESC
      `);

      return res.rows || res; // Retorna os dados brutos para o Grid
    } catch (e: any) {
      console.error(`❌ [SISMOB v245] Erro ao listar:`, e.message);
      return [];
    }
  }

  /**
   * 3. BUSCA ÚNICA (Para carregar o formulário de edição)
   */
  async findOne(tableName: string, id: number, tenantId: string) {
    try {
      const res = await this.db.execute(sql`
        SELECT * FROM ${sql.raw(tableName)} WHERE id = ${id} AND tenant_id = ${tenantId} LIMIT 1
      `);
      const data = res.rows || res;
      return data[0] || null;
    } catch (e) {
      return null;
    }
  }
}
