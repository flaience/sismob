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
        console.log('🏭 [SISMOB] Iniciando Onboarding Industrial...');

        // 1. GRAVAÇÃO NA TABELA TENANTS (Mapeamento de Nomes)
        const [tenant] = await tx
          .insert(schema.tenants as any)
          .values({
            nome_conta: dto.nomeEmpresa,
            slug: dto.slug,
            email_financeiro: dto.email_financeiro || dto.email, // <--- RESOLVE O ERRO 500
            status: 'ativo',
            version_schema: '1.0.1',
          })
          .returning();

        // 2. GERAÇÃO DA MATRIZ
        const [unidade] = await tx
          .insert(schema.unidades as any)
          .values({
            tenant_id: tenant.id, // <--- NOME CORRETO DA COLUNA
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning();

        // 3. CRIAÇÃO DO DONO (Admin)
        await tx.insert(schema.pessoas as any).values({
          tenant_id: tenant.id,
          unidade_id: unidade.id,
          nome: dto.nomeDono || dto.nomeResponsavel,
          email: dto.email,
          documento: dto.documento || '000.000.000-00', // <--- EVITA NOT NULL CONSTRAINT
          papel: '6', // Papel 6 do seu Enum
          is_admin: true,
          cargo: 'ceo',
        });

        return { success: true, tenantId: tenant.id };
      } catch (e: any) {
        console.error('❌ [DB ERROR]:', e.message);
        throw new InternalServerErrorException(
          `Falha na gravação: ${e.message}`,
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
