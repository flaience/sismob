import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. ONBOARDING INDUSTRIAL v2.0
   * Cria: Tenant + Unidade Matriz + Pessoa Admin + Endereço
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        console.log(
          '🏭 [SISMOB] Iniciando Onboarding para:',
          dto.nome_fantasia || dto.nomeEmpresa,
        );

        // A. GRAVAÇÃO DO TENANT
        const [tenant] = await tx
          .insert(schema.tenants as any)
          .values({
            nome_conta: dto.nomeEmpresa,
            nome_fantasia: dto.nome_fantasia || dto.nomeEmpresa,
            url_logo: dto.url_logo || null,
            slug: dto.slug,
            email_financeiro: dto.email_financeiro || dto.email,
            telefone: dto.telefone || null,
            status: 'ativo',
            version_schema: '1.0.1',
          })
          .returning();

        // B. GERAÇÃO DA MATRIZ AUTOMÁTICA
        const [unidade] = await tx
          .insert(schema.unidades as any)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning();

        // C. CRIAÇÃO DO PROPRIETÁRIO (ADMIN DO SISTEMA)
        const [pessoa] = await tx
          .insert(schema.pessoas as any)
          .values({
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nomeResponsavel,
            email: dto.email,
            documento: dto.documento || '000.000.000-00',
            papel: '6', // Dono da Imobiliária
            is_admin: true,
            cargo: 'ceo',
            updated_at: new Date(),
          })
          .returning();

        // D. GRAVAÇÃO DO ENDEREÇO
        if (dto.endereco) {
          await tx.insert(schema.enderecos as any).values({
            pessoa_id: pessoa.id,
            cep: dto.endereco.cep || '00000-000',
            logradouro: dto.endereco.logradouro || 'Não informado',
            numero: dto.endereco.numero || 'SN',
            bairro: dto.endereco.bairro || 'Não informado',
            cidade: dto.endereco.cidade || 'Não informado',
            estado: dto.endereco.estado || '??',
          });
        }

        return { success: true, tenantId: tenant.id };
      } catch (e: any) {
        console.error('❌ [ONBOARDING ERROR]:', e.message);
        throw new InternalServerErrorException(
          `Falha na esteira de produção: ${e.message}`,
        );
      }
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
