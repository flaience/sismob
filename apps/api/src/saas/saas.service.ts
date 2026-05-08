import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * ONBOARDING INDUSTRIAL v2.0
   * Cria: Tenant + Unidade Matriz + Pessoa Admin + Endereço
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        console.log(
          '🏭 [SISMOB] Iniciando Esteira de Onboarding para:',
          dto.nome_fantasia || dto.nomeEmpresa,
        );

        // 1. GRAVAÇÃO DO TENANT (A EMPRESA)
        const [tenant] = await tx
          .insert(schema.tenants as any)
          .values({
            nome_conta: dto.nomeEmpresa, // Razão Social
            nome_fantasia: dto.nome_fantasia || dto.nomeEmpresa,
            url_logo: dto.url_logo || null,
            slug: dto.slug,
            email_financeiro: dto.email_financeiro || dto.email,
            telefone: dto.telefone || null,
            status: 'ativo',
            version_schema: '1.0.1',
          })
          .returning();

        // 2. GERAÇÃO DA MATRIZ AUTOMÁTICA
        const [unidade] = await tx
          .insert(schema.unidades as any)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning();

        // 3. CRIAÇÃO DO PROPRIETÁRIO (ADMIN DO SISTEMA)
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

        // 4. GRAVAÇÃO DO ENDEREÇO DA IMOBILIÁRIA
        // Vinculamos o endereço à pessoa admin para rastreabilidade de contrato
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

        console.log(
          '✅ [SISMOB] Onboarding concluído com sucesso para ID:',
          tenant.id,
        );
        return { success: true, tenantId: tenant.id };
      } catch (e: any) {
        console.error('❌ [ONBOARDING ERROR]:', e.message);
        throw new InternalServerErrorException(
          `Falha na esteira de produção: ${e.message}`,
        );
      }
    });
  }

  // Listagem para o Luis Super-Admin
  async listarTenants() {
    const table = schema.tenants as any;
    return await this.db.select().from(table);
  }
}
