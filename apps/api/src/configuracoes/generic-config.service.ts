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
   * 1. LISTAGEM INDUSTRIAL (Grid)
   */
  async findAll(tableName: string, tenantId: string) {
    try {
      // Usamos SQL puro para garantir que todos os campos (ex: quantidade) cheguem ao Grid
      const res = await this.db.execute(sql`
        SELECT * FROM ${sql.raw(tableName)} 
        WHERE tenant_id = ${tenantId} 
        ORDER BY id DESC
      `);
      return res.rows || res;
    } catch (e: any) {
      console.error(`❌ [SISMOB] Erro ao listar ${tableName}:`, e.message);
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA (Edição)
   */
  async findOne(tableName: string, id: number, tenantId: string) {
    try {
      const res = await this.db.execute(sql`
        SELECT * FROM ${sql.raw(tableName)} 
        WHERE id = ${id} AND tenant_id = ${tenantId} 
        LIMIT 1
      `);
      const data = res.rows || res;
      return data[0] || null;
    } catch (e: any) {
      console.error(
        `❌ [SISMOB] Erro ao buscar ID ${id} em ${tableName}:`,
        e.message,
      );
      return null;
    }
  }

  /**
   * 3. GRAVAÇÃO (UPSERT)
   */
  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const { id, created_at, updated_at, imobiliariaId, ...limpo } = dto;

      // MODO NUCLEAR PARA INSERÇÃO DE ATRIBUTOS (Resolve o erro de quantidade)
      if (tableName === 'atributos' && (!id || id === 'undefined')) {
        return await this.db.execute(sql`
          INSERT INTO atributos (nome, quantidade, categoria_id, tenant_id, updated_at)
          VALUES (${limpo.nome}, ${Number(limpo.quantidade || 1)}, ${Number(limpo.categoria_id)}, ${tenantId}, NOW())
          RETURNING *;
        `);
      }

      // MODO NUCLEAR PARA UPDATE DE ATRIBUTOS
      if (tableName === 'atributos' && id) {
        return await this.db.execute(sql`
          UPDATE atributos 
          SET nome = ${limpo.nome}, quantidade = ${Number(limpo.quantidade)}, 
              categoria_id = ${Number(limpo.categoria_id)}, updated_at = NOW()
          WHERE id = ${Number(id)} AND tenant_id = ${tenantId}
        `);
      }

      // FALLBACK PARA OUTRAS TABELAS (Unidades, Bancos...)
      const table = (schema as any)[tableName];
      const payload: any = {
        ...limpo,
        tenant_id: tenantId,
        updated_at: new Date(),
      };

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        const [novo] = await (this.db
          .insert(table)
          .values(payload)
          .returning() as any);
        return novo;
      }
    } catch (e: any) {
      console.error(`❌ [SISMOB] Erro no upsert de ${tableName}:`, e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * 4. REMOÇÃO (O MÉTODO QUE FALTAVA)
   * Resolve o erro TS2339 no Controller
   */
  async remove(tableName: string, id: number, tenantId: string) {
    try {
      console.log(`🗑️ [SISMOB] Excluindo registro: ${tableName} | ID: ${id}`);

      // SQL Puro para garantir que a trava de segurança por Tenant seja respeitada
      return await this.db.execute(sql`
        DELETE FROM ${sql.raw(tableName)} 
        WHERE id = ${id} AND tenant_id = ${tenantId}
      `);
    } catch (e: any) {
      console.error(`❌ [SISMOB] Erro ao remover de ${tableName}:`, e.message);
      throw new InternalServerErrorException(
        'Não foi possível excluir o registro. Verifique dependências.',
      );
    }
  }
}
