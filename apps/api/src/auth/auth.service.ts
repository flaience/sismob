import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabaseAdmin;

  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

  async onboarding(dto: any) {
    return await this.db.transaction(async (tx) => {
      // 1. Criar o Usuário no Supabase Auth
      const { data: authUser, error: authError } =
        await this.supabaseAdmin.auth.admin.createUser({
          email: dto.emailAdmin,
          password: dto.senhaAdmin,
          email_confirm: true,
        });

      if (authError) throw new BadRequestException(authError.message);

      // 2. Criar o TENANT (Papel 6 - Cliente da Flaience para cobrança)
      const [tenant] = await tx
        .insert(schema.pessoas)
        .values({
          nome: dto.razaoSocial,
          documento: dto.cnpj, // CNPJ da empresa para NF
          email: dto.emailFinanceiro,
          tipo: 'j',
          papel: '6',
          statusAssinatura: 'ativo',
        } as any)
        .returning();

      // 3. Criar a IMOBILIÁRIA (Papel 5 - A entidade que aparece no site)
      const [imobiliaria] = await tx
        .insert(schema.pessoas)
        .values({
          nome: dto.nomeFantasia,
          documento: dto.cnpj,
          email: dto.emailContato,
          tipo: 'j',
          papel: '5',
          imobiliariaId: tenant.id, // Opcional: Vincular ao financeiro
        } as any)
        .returning();

      // 4. Criar o ADMINISTRADOR (Papel 1 - O dono da conta)
      await tx.insert(schema.pessoas).values({
        id: authUser.user.id, // ID do Supabase
        imobiliariaId: imobiliaria.id, // Vinculado à Imobiliária dele
        nome: dto.nomeAdmin,
        email: dto.emailAdmin,
        documento: dto.cpfAdmin,
        tipo: 'f',
        papel: '1', // Usuário/Admin
        isCorretor: true,
      } as any);

      return {
        message: 'SaaS Ativado! Imobiliária pronta para uso.',
        imobiliariaId: imobiliaria.id,
      };
    });
  }
}
