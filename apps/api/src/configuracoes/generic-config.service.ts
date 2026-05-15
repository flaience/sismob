//src/configuracoes/generic-config.service.ts

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

  async upsert(tableName: string, dto: any, tenantId: string) {
    try {
      const table = (schema as any)[tableName];
      if (!table) throw new Error(`Tabela ${tableName} inexistente.`);

      // 1. LIMPEZA E EXTRAÇÃO
      const {
        id,
        created_at,
        updated_at,
        imobiliariaId,
        tenant_id,
        ...dadosLimpos
      } = dto;

      // 2. MONTAGEM DO PAYLOAD (AQUI ESTÁ A MÁGICA)
      // Forçamos o 'tenant_id' como uma chave de string para o Drizzle não apagar
      const payload: any = {
        ...dadosLimpos,
        updated_at: new Date(),
      };

      // Injeção forçada usando o nome físico da coluna
      payload['tenant_id'] = tenantId;

      if (tableName === 'atributos') {
        payload.quantidade = Number(dto.quantidade || 1);
        payload.categoria_id = Number(dto.categoria_id);
      }

      console.log(
        `🚀 [SISMOB v232] Tabela: ${tableName} | Gravando para: ${tenantId}`,
      );

      if (id && id !== 'undefined') {
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        // 3. USAMOS 'table as any' PARA BYPASS TOTAL DE VALIDAÇÃO DE SCHEMA
        const [novo] = await (this.db
          .insert(table as any)
          .values(payload)
          .returning() as any);
        return novo;
      }
    } catch (e: any) {
      console.error(`❌ [SISMOB FATAL v232]:`, e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  async findAll(tableName: string, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .select()
      .from(table)
      .where(eq(table.tenant_id, tenantId));
  }

  async remove(tableName: string, id: number, tenantId: string) {
    const table = (schema as any)[tableName];
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
