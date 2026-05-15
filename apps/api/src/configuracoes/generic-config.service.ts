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
   */ // apps/api/src/configuracoes/generic-config.service.ts

  async findAll(tableName: string, tenantId: string) {
    try {
      // tableName agora vem como 'categorias_atributos'
      const res = await this.db.execute(sql`
        SELECT * FROM ${sql.raw(tableName)} 
        WHERE tenant_id = ${tenantId} 
        ORDER BY id DESC
      `);
      return res.rows || res;
    } catch (e: any) {
      console.error(`❌ [SISMOB] Erro no findAll ${tableName}:`, e.message);
      return [];
    }
  }

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
      return null;
    }
  }

  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const { id, created_at, updated_at, imobiliariaId, ...limpo } = dto;

      // 1. INSERÇÃO (Bypass total para qualquer tabela de config)
      if (!id || id === 'undefined') {
        const colunas = Object.keys(limpo).filter((k) => k !== 'tenant_id');
        const valores = colunas.map((k) => {
          if (k === 'quantidade' || k === 'categoria_id')
            return Number(limpo[k]);
          return limpo[k];
        });

        return await this.db.execute(sql`
          INSERT INTO ${sql.raw(tableName)} (tenant_id, ${sql.raw(colunas.join(', '))}, updated_at)
          VALUES (${tenantId}, ${sql.join(valores, sql`, `)}, NOW())
          RETURNING *;
        `);
      }

      // 2. UPDATE (Bypass total)
      const sets = Object.keys(limpo).map((k) => {
        const val =
          k === 'quantidade' || k === 'categoria_id'
            ? Number(limpo[k])
            : limpo[k];
        return sql`${sql.raw(k)} = ${val}`;
      });

      return await this.db.execute(sql`
        UPDATE ${sql.raw(tableName)} 
        SET ${sql.join(sets, sql`, `)}, updated_at = NOW()
        WHERE id = ${Number(id)} AND tenant_id = ${tenantId}
      `);
    } catch (e: any) {
      console.error(`❌ [SISMOB] Erro no upsert ${tableName}:`, e.message);
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
