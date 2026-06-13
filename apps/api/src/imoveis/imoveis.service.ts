import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc } from 'drizzle-orm';
import {
  persistirEnderecoLego,
  removerEnderecoLego,
} from '../common/utils/address-factory';

@Injectable()
export class ImoveisService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async findAll(tenantId: string) {
    const i = schema.imoveis as any;
    const e = schema.enderecos as any;
    return await this.db
      .select()
      .from(i)
      .leftJoin(e, eq(i.endereco_id, e.id))
      .where(eq(i.tenant_id, tenantId))
      .orderBy(desc(i.id));
  }

  async findOne(id: number, tenantId: string) {
    const i = schema.imoveis as any;
    const e = schema.enderecos as any;
    const res = await this.db
      .select()
      .from(i)
      .leftJoin(e, eq(i.endereco_id, e.id))
      .where(and(eq(i.id, id), eq(i.tenant_id, tenantId)))
      .limit(1);

    if (!res[0]) return null;
    return { ...res[0].imoveis, endereco: res[0].enderecos };
  }

  async upsert(dto: any, files: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      const { id, endereco, ...dados } = dto;
      const iTable = schema.imoveis as any;

      const endId = await persistirEnderecoLego(tx, endereco, dto.endereco_id);
      const payload = {
        ...dados,
        tenant_id: tenantId,
        endereco_id: endId,
        updated_at: new Date(),
      };

      if (id && id !== 'undefined') {
        await tx.update(iTable).set(payload).where(eq(iTable.id, id));
        return { id, success: true };
      } else {
        const [novo] = await tx.insert(iTable).values(payload).returning();
        return { id: novo.id, success: true };
      }
    });
  }

  async remove(id: number, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      const iTable = schema.imoveis as any;
      const [reg] = await tx.select().from(iTable).where(eq(iTable.id, id));
      if (reg?.endereco_id) await removerEnderecoLego(tx, reg.endereco_id);
      return await tx.delete(iTable).where(eq(iTable.id, id));
    });
  }
}
