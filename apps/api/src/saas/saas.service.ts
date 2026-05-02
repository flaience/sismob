//src/saas/saas.service.ts
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
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        // 1. Criar a Empresa (Tenant)
        const [tenant] = await tx
          .insert(schema.tenants as any)
          .values({
            nome_conta: dto.nomeEmpresa,
            slug: dto.slug,
            email_financeiro: dto.email_financeiro,
            status: 'ativo',
            version_schema: '1.0.1',
          })
          .returning();

        // 2. Criar a Unidade Matriz Automática
        const [unidade] = await tx
          .insert(schema.unidades as any)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ',
            is_matriz: true,
          })
          .returning();

        // 3. Criar o Usuário Dono (Admin)
        await tx.insert(schema.pessoas as any).values({
          tenant_id: tenant.id,
          unidade_id: unidade.id,
          nome: dto.nomeDono,
          email: dto.email,
          documento: dto.documento,
          papel: '6', // Papel 6 = Dono da Imobiliária
          is_admin: true,
          cargo: 'gerente_geral',
        });

        return { success: true, tenantId: tenant.id };
      } catch (e) {
        throw new InternalServerErrorException(`Erro no Banco: ${e.message}`);
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
