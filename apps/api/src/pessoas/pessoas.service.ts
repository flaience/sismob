import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, ilike, or } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  // 1. Usamos 'any' no banco para evitar conflito de versão do Drizzle entre pacotes
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  // 2. Busca por ID Único (Resolvendo erro do Controller)
  // apps/api/src/pessoas/pessoas.service.ts

  // Procure o método findOne e substitua por este:
  async findOne(id: string, tenantId: string) {
    // 1. O TIRO DE MISERICÓRDIA NO ERRO:
    // Se o ID ou o TenantId forem nulos ou a string "undefined", aborta com segurança.
    if (!id || !tenantId || id === 'undefined' || tenantId === 'undefined') {
      console.warn(
        `⚠️ [SISMOB] Tentativa de busca com ID inválido: id=${id}, tenant=${tenantId}`,
      );
      return null;
    }

    try {
      const table = schema.pessoas as any;
      const results = await this.db
        .select()
        .from(table)
        .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (error: any) {
      console.error('❌ [SISMOB] Erro no Service findOne:', error.message);
      return null;
    }
  }
  // 3. Salvar (Inclusão e Alteração) - RECEBE 2 ARGUMENTOS
  async save(dto: any, tenantId: string) {
    const table = schema.pessoas as any;
    const { id, ...data } = dto;

    // LIMPEZA INDUSTRIAL: Garante que o ID da imobiliária vai para a coluna certa
    const payload = {
      ...data,
      tenant_id: tenantId,
      // Se não vier documento (ex: lead), enviamos '000' para não quebrar o NOT NULL do banco
      documento: dto.documento || '00000000000',
      updated_at: new Date(),
    };

    try {
      if (id && id !== 'undefined') {
        console.log(`🏭 [SISMOB] Atualizando Registro: ${id}`);
        return await this.db.update(table).set(payload).where(eq(table.id, id));
      } else {
        console.log(
          `🏭 [SISMOB] Criando Novo Registro para Tenant: ${tenantId}`,
        );
        return await this.db.insert(table).values(payload).returning();
      }
    } catch (error: any) {
      console.error('❌ [DB ERROR]:', error.hint || error.message);
      throw new InternalServerErrorException(
        `Falha no Banco: ${error.message}`,
      );
    }
  }

  // 4. Identificação por Host
  // async findImobiliariaByHost(host: string) {
  //   const table = schema.tenants as any;
  //   const results = await this.db
  //     .select()
  //     .from(table)
  //     .where(
  //       or(
  //         eq(table.dominio_customizado, host),
  //         eq(table.slug, host.split('.')[0]),
  //       ),
  //     )
  //     .limit(1);
  //   return results[0] || null;
  // }
  async findImobiliariaByHost(host: string) {
    // Proteção contra host vazio
    if (!host || host === 'undefined') return null;

    try {
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

      return results.length > 0 ? results[0] : null;
    } catch (e) {
      return null;
    }
  }
  // 5. Busca por Papel
  async findByRole(papel: string, tenantId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      let conds = [eq(table.papel, papel), eq(table.tenant_id, tenantId)];

      if (search) conds.push(ilike(table.nome, `%${search}%`));

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (error: any) {
      console.error('❌ [SISMOB] Erro no findByRole:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // 6. Remover
  async remove(id: string, imobId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, imobId)));
  }
}
