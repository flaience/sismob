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

  async registerTenant(dto: any) {
    if (!this.supabaseAdmin) {
      throw new BadRequestException('Serviço de autenticação não configurado.');
    }

    try {
      return await this.db.transaction(async (tx) => {
        // 1. Criar o Usuário no Supabase Auth
        const { data: authUser, error: authError } =
          await this.supabaseAdmin.auth.admin.createUser({
            email: dto.emailAdmin,
            password: dto.senhaAdmin,
            email_confirm: true,
          });

        if (authError) throw new BadRequestException(authError.message);
        if (!authUser.user)
          throw new BadRequestException('Erro ao gerar ID do usuário.');

        // 2. Criar o TENANT (Papel 6)
        // Usamos (schema.pessoas as any) para evitar erro de tipo no monorepo
        const [tenant] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            nome: dto.razaoSocial || dto.nomeImobiliaria + ' (Financeiro)',
            documento: dto.cnpj,
            email: dto.emailFinanceiro || dto.emailAdmin,
            tipo: 'j',
            papel: '6',
            statusAssinatura: 'ativo',
          })
          .returning();

        // 3. Criar a IMOBILIÁRIA (Papel 5)
        const [imobiliaria] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            nome: dto.nomeFantasia || dto.nomeImobiliaria,
            documento: dto.cnpj,
            email: dto.emailAdmin,
            tipo: 'j',
            papel: '5',
            imobiliariaId: tenant.id,
          })
          .returning();

        // 4. Criar o ADMINISTRADOR (Papel 1)
        const [adminUser] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUser.user.id,
            imobiliariaId: imobiliaria.id,
            nome: dto.nomeAdmin,
            email: dto.emailAdmin,
            documento: dto.cpfAdmin || '000.000.000-00',
            tipo: 'f',
            papel: '1',
          })
          .returning();

        return {
          message: 'SaaS Ativado com sucesso!',
          imobiliaria: imobiliaria.nome,
          idImobiliaria: imobiliaria.id,
          admin: adminUser.nome,
        };
      });
    } catch (error) {
      console.error('❌ Erro no registerTenant:', error.message);
      throw new BadRequestException(error.message);
    }
  }
}
