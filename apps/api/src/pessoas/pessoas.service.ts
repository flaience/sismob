import { Injectable, Inject } from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, ilike, or } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  // 1. Usamos 'any' no banco para evitar conflito de versão do Drizzle entre pacotes
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  // 2. Busca por ID Único (Resolvendo erro do Controller)
  async findOne(id: string) {
    const table = schema.pessoas as any;
    const results = await this.db
      .select()
      .from(table)
      .where(eq(table.id, id))
      .limit(1);
    // Garante que retorna nulo se não achar, ou o primeiro objeto (sem colchetes)
    return results.length > 0 ? results[0] : null;
  }
  // 3. Salvar (Inclusão e Alteração) - RECEBE 2 ARGUMENTOS
  async save(dto: any, tenantId: string) {
    const table = schema.pessoas as any;
    const { id, ...data } = dto;
    const payload = { ...data, tenant_id: tenantId, updated_at: new Date() };

    if (id && id !== 'undefined') {
      return await this.db.update(table).set(payload).where(eq(table.id, id));
    } else {
      return await this.db.insert(table).values(payload).returning();
    }
  }

  // 4. Identificação por Host
  async findImobiliariaByHost(host: string) {
    const table = schema.tenants as any;
    const results = await this.db
      .select()
      .from(table)
      .where(
        or(
          eq(table.dominio_customizado, host),
          eq(table.slug, host.split('.')[0]),
        ),
      )
      .limit(1);
    return results[0] || null;
  }

  // 5. Busca por Papel
  async findByRole(papel: string, imobId: string, search?: string) {
    const table = schema.pessoas as any;
    let conds = [eq(table.papel, papel), eq(table.tenant_id, imobId)];
    if (search) conds.push(ilike(table.nome, `%${search}%`));
    return await this.db
      .select()
      .from(table)
      .where(and(...conds));
  }

  // 6. Remover
  async remove(id: string, imobId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, imobId)));
  }
}
