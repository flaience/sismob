//src/pessoas/pessoas.service.ts
import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, or, ilike } from 'drizzle-orm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PessoasService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    @Inject('DRIZZLE_CONNECTION') private db: PostgresJsDatabase<typeof schema>,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      this.supabaseAdmin = createClient(url, key);
    }
  }

  // 1. IDENTIFICAÇÃO PÚBLICA (DOMÍNIO)
  async findImobiliariaByHost(host: string) {
    try {
      const table = schema.tenants as any;
      // Busca por domínio customizado ou pelo slug
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

      if (results.length === 0) return null;
      return results[0];
    } catch (error) {
      console.error(
        '❌ Erro Crítico na Identificação do Tenant:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Falha ao identificar unidade de negócio.',
      );
    }
  }

  // 2. BUSCA PARA O GRID (MATA O ERRO 500)
  // teste

  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      // Usamos nomes físicos do banco para não haver erro de tradução
      const table = schema.pessoas as any;

      let conds = [
        eq(table.imobiliaria_id, imobiliariaId), // <--- SEMPRE COM UNDERLINE
        eq(table.papel, papel),
      ];

      if (search) {
        conds.push(ilike(table.nome, `%${search}%`) as any);
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (error) {
      console.error('❌ Erro no findByRole:', error.message);
      return [];
    }
  }

  // 3. BUSCA UM ÚNICO (PARA EDIÇÃO)
  async findOne(id: string, tenantId: string) {
    const table = schema.pessoas as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
    return results[0] || null;
  }

  // 4. MOTOR UNIVERSAL: SAVE (Inclusão e Alteração)
  /**
   * MOTOR DE GRAVAÇÃO UNIFICADO (Master/Detail: Pessoa + Endereço)
   */
  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      const table = schema.pessoas as any;
      const isUpdate = !!dto.id;
      const payload = { ...dto, tenant_id: tenantId, updated_at: new Date() };

      if (isUpdate) {
        return await tx.update(table).set(payload).where(eq(table.id, dto.id));
      } else {
        return await tx.insert(table).values(payload).returning();
      }
    });
  }

  // 5. REMOÇÃO
  async remove(id: string, imobiliariaId: string) {
    try {
      const table = schema.pessoas as any;

      // ATENÇÃO: No seu schema a coluna é 'tenant_id'.
      // O parâmetro que recebemos é 'imobiliariaId'.
      return await this.db.delete(table).where(
        and(
          eq(table.id, id),
          eq(table.tenant_id, imobiliariaId), // <--- AJUSTADO PARA tenant_id
        ),
      );
    } catch (error) {
      console.error('❌ Erro ao remover pessoa:', error.message);
      throw new InternalServerErrorException(
        'Não foi possível excluir o registro.',
      );
    }
  }
}
