import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class SaasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // 1. LISTAR TODAS AS IMOBILIÁRIAS (Cockpit Luis)
  async listarTenants() {
    try {
      return await this.db.select().from(schema.tenants as any);
    } catch (e) {
      throw new InternalServerErrorException(
        `Erro ao listar tenants: ${e.message}`,
      );
    }
  }

  // 2. ONBOARDING INDUSTRIAL (Cria Empresa + Matriz + Admin)
  // 2. ONBOARDING INDUSTRIAL (Cria Empresa + Matriz + Admin)
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx) => {
      try {
        console.log(`🚀 Iniciando Onboarding para: ${dto.nomeEmpresa}`);

        // A. Criar a Empresa (Tenant) - Ajustado para v5.1
        const [tenant] = await (tx
          .insert(schema.tenants as any)
          .values({
            nome_conta: dto.nomeEmpresa,
            slug: dto.slug,
            dominio_customizado: dto.dominio || null,
            email_financeiro: dto.emailFinanceiro || dto.email, // <--- OBRIGATÓRIO
            version_schema: '1.0.1', // <--- OBRIGATÓRIO PARA IA/RAG
            status: 'ativo',
          })
          .returning() as any);

        // B. Criar a Unidade Matriz automaticamente (Padrão Sismob)
        const [unidade] = await (tx
          .insert(schema.unidades as any)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning() as any);

        // C. Criar o Usuário Admin da Imobiliária (Papel 6)
        await tx.insert(schema.pessoas as any).values({
          id: sql`gen_random_uuid()`, // Garante um novo ID se não vier no DTO
          tenant_id: tenant.id,
          unidade_id: unidade.id,
          nome: dto.nomeResponsavel,
          email: dto.email,
          documento: dto.documento,
          papel: '6', // Dono da Imobiliária
          is_admin: true,
          cargo: 'gerente_geral',
        });

        console.log(`✅ Onboarding concluído com sucesso: ${tenant.slug}`);
        return { success: true, tenantId: tenant.id, slug: tenant.slug };
      } catch (e) {
        console.error('❌ Erro Crítico no Onboarding:', e.message);
        // O transaction fará o rollback automático aqui
        throw new InternalServerErrorException(
          `Falha no processo de Onboarding: ${e.message}`,
        );
      }
    });
  }
  // 3. FINANCEIRO FLAIENCE: Ver faturamento consolidado
  async getFinanceiroFlaience() {
    try {
      const tenantsTable = schema.tenants as any;
      const stats = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(tenantsTable)
        .where(eq(tenantsTable.status, 'ativo'));

      return {
        imobiliariasAtivas: Number(stats[0].count),
        faturamentoEstimado: Number(stats[0].count) * 299, // Exemplo de valor
      };
    } catch (e) {
      return { imobiliariasAtivas: 0, faturamentoEstimado: 0 };
    }
  }
}
