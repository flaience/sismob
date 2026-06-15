import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, ilike, sql } from 'drizzle-orm';
import {
  persistirEnderecoLego,
  removerEnderecoLego,
} from '../common/utils/address-factory';

@Injectable()
export class PessoasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async findByRole(papel: string, tenantId: string, search?: string) {
    const p = schema.pessoas as any;
    const e = schema.enderecos as any;
    let conds = [eq(p.papel, papel), eq(p.tenant_id, tenantId)];
    if (search) conds.push(ilike(p.nome, `%${search}%`));

    return await this.db
      .select()
      .from(p)
      .leftJoin(e, eq(p.endereco_id, e.id))
      .where(and(...conds));
  }

  async findOne(id: string, tenantId: string) {
    // PROTEÇÃO CONTRA O ERRO 'UNDEFINED_VALUE'
    if (!id || id === 'undefined' || !tenantId || tenantId === 'undefined') {
      console.warn('⚠️ [SISMOB] Tentativa de busca com parâmetros nulos.');
      return null;
    }

    try {
      console.log(
        `📡 [SISMOB] Buscando perfil completo: ${id} no tenant ${tenantId}`,
      );

      // O TIRO DE MISERICÓRDIA: SQL Puro com Join para o endereço
      const res = await this.db.execute(sql`
        SELECT 
          p.*, 
          e.cep, e.logradouro, e.numero, e.bairro, e.cidade, e.estado
        FROM pessoas p
        LEFT JOIN enderecos e ON e.id = p.endereco_id
        WHERE p.id = ${id} AND p.tenant_id = ${tenantId}
        LIMIT 1
      `);

      const rows = res.rows || res;
      if (!rows || rows.length === 0) return null;
      const row = rows[0];

      return {
        ...row,
        endereco: {
          cep: row.cep || '',
          logradouro: row.logradouro || '',
          numero: row.numero || '',
          bairro: row.bairro || '',
          cidade: row.cidade || '',
          estado: row.estado || '',
        },
      };
    } catch (e: any) {
      console.error('❌ [DB FATAL]:', e.message);
      return null;
    }
  }

  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      const { id, endereco, ...dados } = dto;
      const pTable = schema.pessoas as any;

      const enderecoId = await persistirEnderecoLego(
        tx,
        endereco,
        dto.endereco_id,
      );
      const payload = {
        ...dados,
        tenant_id: tenantId,
        endereco_id: enderecoId,
        updated_at: new Date(),
      };

      if (id && id !== 'undefined') {
        await tx.update(pTable).set(payload).where(eq(pTable.id, id));
        return { id, success: true };
      } else {
        const [nova] = await tx.insert(pTable).values(payload).returning();
        return { id: nova.id, success: true };
      }
    });
  }

  async remove(id: string, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      const pTable = schema.pessoas as any;
      const [reg] = await tx.select().from(pTable).where(eq(pTable.id, id));
      if (reg?.endereco_id) await removerEnderecoLego(tx, reg.endereco_id);
      return await tx.delete(pTable).where(eq(pTable.id, id));
    });
  }
}
