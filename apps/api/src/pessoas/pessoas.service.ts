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
    // 1. O SEGREDO: Mapeamos o DTO para o Schema físico do Banco
    // Garantimos que nenhum campo obrigatório vá nulo
    const payload = {
      tenant_id: tenantId,
      unidade_id: dto.unidade_id ? Number(dto.unidade_id) : null,
      nome: dto.nome || 'Sem Nome',
      email: dto.email || 'sem@email.com',
      // Se for Lead (2) e não tiver documento, colocamos um padrão para o banco aceitar
      documento: dto.documento || `LEAD-${Date.now()}`,
      papel: String(dto.papel || '2'),
      tipo: dto.tipo || 'f',
      telefone: dto.telefone || null,
      cargo: dto.cargo || null,
      updated_at: new Date(),
    };

    try {
      const table = schema.pessoas as any;

      if (dto.id && dto.id !== 'undefined') {
        console.log(`🏭 [SISMOB] Atualizando registro: ${dto.id}`);
        return await this.db
          .update(table)
          .set(payload)
          .where(eq(table.id, dto.id));
      } else {
        console.log(
          `🏭 [SISMOB] Criando novo registro para imobiliária: ${tenantId}`,
        );
        const [novo] = await this.db.insert(table).values(payload).returning();
        return novo;
      }
    } catch (error: any) {
      // ESTE LOG VAI APARECER NO SEU PAINEL DO RAILWAY
      console.error('❌ [ERRO DE BANCO]:', error.message);
      throw new InternalServerErrorException(
        `Erro no Postgres: ${error.message}`,
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
