import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';
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
    const p = schema.pessoas as any;
    const e = schema.enderecos as any;
    const res = await this.db
      .select()
      .from(p)
      .leftJoin(e, eq(p.endereco_id, e.id))
      .where(and(eq(p.id, id), eq(p.tenant_id, tenantId)))
      .limit(1);

    if (!res[0]) return null;
    return { ...res[0].pessoas, endereco: res[0].enderecos };
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
