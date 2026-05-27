import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, sql } from 'drizzle-orm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SaasService {
  private supabaseAdmin: SupabaseClient;
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. ONBOARDING INDUSTRIAL v2.0
   * Cria: Tenant + Unidade Matriz + Pessoa Admin + Endereço
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      // 1. Cria a Imobiliária (Tenant)
      const [tenant] = await tx
        .insert(schema.tenants as any)
        .values({
          nome_conta: dto.nomeEmpresa,
          slug: dto.slug,
          email_financeiro: dto.email,
          status: 'ativo',
        })
        .returning();

      // 2. MÁGICA INDUSTRIAL: Cria o Login no Supabase Auth
      // Usamos a Admin API para definir a senha provisória na hora
      const { data: authUser, error } =
        await this.supabaseAdmin.auth.admin.createUser({
          email: dto.email,
          password: 'Mudar@123', // Senha padrão para o primeiro acesso
          email_confirm: true,
          user_metadata: { role: 'admin', tenantId: tenant.id },
        });

      if (error) throw new Error('Falha ao criar login: ' + error.message);

      // 3. Cria o Perfil vinculado ao ID que o Supabase gerou
      await tx.insert(schema.pessoas as any).values({
        id: authUser.user.id, // VINCULO ESSENCIAL
        tenant_id: tenant.id,
        nome: dto.nomeDono,
        email: dto.email,
        papel: '6', // Dono
        is_admin: true,
      });

      return { success: true, senhaProvisoria: 'Mudar@123' };
    });
  }

  /**
   * 2. COCKPIT FINANCEIRO FLAIENCE
   * Usado pelo Luis (Super-Admin) para ver a saúde do SaaS
   */
  async getFinanceiroFlaience() {
    try {
      const table = schema.tenants as any;
      const stats = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(table)
        .where(eq(table.status, 'ativo'));

      return {
        imobiliariasAtivas: Number(stats[0].count),
        faturamentoEstimado: Number(stats[0].count) * 299, // Regra de negócio: R$ 299/mês
        timestamp: new Date(),
      };
    } catch (e) {
      return { imobiliariasAtivas: 0, faturamentoEstimado: 0 };
    }
  }

  // Adicione este método ao seu SaasService
  async liberarAcessoImobiliaria(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      // 1. Cria a Empresa (Tenant) com o CNPJ/Documento
      const [tenant] = await tx
        .insert(schema.tenants as any)
        .values({
          nome_conta: dto.nomeEmpresa,
          slug: dto.slug,
          email_financeiro: dto.email,
          status: 'ativo', // Ativação imediata
          documento_cnpj: dto.cnpj, // Campo para controle de licença
        })
        .returning();

      // 2. Cria a Unidade Matriz
      const [unidade] = await tx
        .insert(schema.unidades as any)
        .values({
          tenant_id: tenant.id,
          nome: 'MATRIZ',
          is_matriz: true,
        })
        .returning();

      // 3. MÁGICA INDUSTRIAL: Cria o Login no Supabase Auth via Service Role
      // (Isso evita que o cliente precise confirmar e-mail para começar)
      const { data: authUser, error } =
        await this.supabaseAdmin.auth.admin.createUser({
          email: dto.email,
          password: dto.senhaProvisoria || 'Sismob@123',
          email_confirm: true,
          user_metadata: { tenantId: tenant.id, papel: '6' },
        });

      if (error)
        throw new Error('Erro ao criar login no Supabase: ' + error.message);

      // 4. Cria o Perfil na nossa tabela Pessoas (Papel 6 - Dono)
      await tx.insert(schema.pessoas as any).values({
        id: authUser.user.id, // O mesmo ID que o Supabase gerou
        tenant_id: tenant.id,
        unidade_id: unidade.id,
        nome: dto.nomeDono,
        email: dto.email,
        documento: dto.documentoDono,
        papel: '6',
        is_admin: true,
        cargo: 'diretor',
      });

      return {
        success: true,
        msg: 'Acesso liberado. Senha padrão: Sismob@123',
      };
    });
  }
  /**
   * 3. LISTAGEM DE CLIENTES
   */
  async listarTenants() {
    try {
      const table = schema.tenants as any;
      return await this.db.select().from(table);
    } catch (e) {
      return [];
    }
  }
}
