import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      this.supabaseAdmin = createClient(url, key);
    }
  }

  // apps/api/src/auth/auth.service.ts

  async registerTenant(dto: any) {
    return await this.db.transaction(async (tx) => {
      // 1. Criar o registro mestre na tabela TENANTS
      const [tenant] = await (tx.insert(schema.tenants as any) as any)
        .values({
          nome_conta: dto.nomeImobiliaria,
          slug:
            dto.slug || dto.nomeImobiliaria.toLowerCase().replace(/ /g, '-'),
          email_financeiro: dto.emailFinanceiro,
          status: 'trial',
        })
        .returning();

      // 2. Criar a Unidade MATRIZ
      const [unidade] = await (tx.insert(schema.unidades as any) as any)
        .values({
          tenant_id: tenant.id,
          nome: 'Matriz',
          is_matriz: true,
        })
        .returning();

      // 3. Criar o Usuário no Supabase Auth
      const { data: authUser } = await this.supabaseAdmin.auth.admin.createUser(
        {
          email: dto.emailAdmin,
          password: dto.senha,
          email_confirm: true,
        },
      );

      // 4. Criar o Perfil da Pessoa (Admin do Tenant)
      await (tx.insert(schema.pessoas as any) as any).values({
        id: authUser.user.id,
        tenant_id: tenant.id,
        unidade_id: unidade.id,
        nome: dto.nomeAdmin,
        email: dto.emailAdmin,
        papel: '1', // Admin/Corretor
        is_admin: true,
      });

      return {
        tenantId: tenant.id,
        message: 'Contrato ativado manualmente com sucesso!',
      };
    });
  }
}
