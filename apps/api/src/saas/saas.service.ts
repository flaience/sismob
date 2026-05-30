import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. BUSCA ÚNICA (Para carregar o formulário de edição)
   * Resolve o erro de "No overload matches"
   */
  async buscarUmTenant(id: string) {
    try {
      const table = schema.tenants as any;
      const res = await this.db
        .select()
        .from(table)
        .where(eq(table.id, id))
        .limit(1);

      return res[0] || null;
    } catch (e: any) {
      console.error('❌ [SISMOB] Erro ao buscar imobiliária:', e.message);
      return null;
    }
  }

  /**
   * 2. EXCLUSÃO REAL (Com rastro industrial)
   */
  async removerTenant(id: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const table = schema.tenants as any;
        // O Postgres fará o cascade automático nas tabelas filhas (unidades, pessoas, imóveis)
        await tx.delete(table).where(eq(table.id, id));
        return { success: true };
      } catch (e: any) {
        console.error('❌ [SISMOB] Erro ao excluir imobiliária:', e.message);
        throw new InternalServerErrorException(
          'Erro de integridade: Verifique se há dados vinculados.',
        );
      }
    });
  }

  /**
   * 3. LISTAGEM GLOBAL (Para o Cockpit do Luis)
   */
  async listarTenants() {
    try {
      const table = schema.tenants as any;
      return await this.db.select().from(table);
    } catch (e) {
      return [];
    }
  }

  /**
   * 4. MOTOR DE ONBOARDING v2.0
   * Cria: Empresa + Matriz + Admin + Endereço
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const tableTenants = schema.tenants as any;
        const tableUnidades = schema.unidades as any;
        const tablePessoas = schema.pessoas as any;
        const tableEnderecos = schema.enderecos as any;

        // A. GRAVAÇÃO DO TENANT
        const [tenant] = await tx
          .insert(tableTenants)
          .values({
            nome_conta: dto.nome_conta || dto.nomeEmpresa,
            nome_fantasia:
              dto.nome_fantasia || dto.nome_conta || dto.nomeEmpresa,
            url_logo: dto.url_logo || null,
            slug: dto.slug,
            email_financeiro: dto.email_financeiro || dto.email,
            telefone: dto.telefone || null,
            status: 'ativo',
            version_schema: '1.0.1',
          })
          .returning();

        // B. GERAÇÃO DA MATRIZ
        const [unidade] = await tx
          .insert(tableUnidades)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning();

        // C. CRIAÇÃO DO ADMIN
        const [pessoa] = await tx
          .insert(tablePessoas)
          .values({
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_conta,
            email: dto.email || dto.email_financeiro,
            documento: dto.documento || '000.000.000-00',
            papel: '6', // Dono
            is_admin: true,
            cargo: 'ceo',
            updated_at: new Date(),
          })
          .returning();

        // D. GRAVAÇÃO DO ENDEREÇO
        if (dto.endereco) {
          await tx.insert(tableEnderecos).values({
            pessoa_id: pessoa.id,
            ...dto.endereco,
          });
        }

        return { success: true, tenantId: tenant.id };
      } catch (e: any) {
        console.error('❌ [ONBOARDING FATAL]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }
}
