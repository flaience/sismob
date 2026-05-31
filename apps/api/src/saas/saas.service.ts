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
   * 1. LISTAGEM GLOBAL (Para o Luis)
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
   * 2. BUSCA ÚNICA (Para carregar o formulário de edição)
   * O casting 'as any' mata o erro de 'No overload matches'
   */
  async buscarUmTenant(id: string) {
    try {
      const table = schema.tenants as any;
      const res = await this.db
        .select()
        .from(table)
        .where(eq(table.id, id)) // Agora o eq() aceita o ID sem reclamar
        .limit(1);

      return res[0] || null;
    } catch (e: any) {
      console.error('❌ [SISMOB] Erro ao buscar imobiliária:', e.message);
      return null;
    }
  }

  /**
   * 3. MOTOR DE ONBOARDING v2.0
   * Cria: Empresa + Matriz + Admin + Endereço
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const tableTenants = schema.tenants as any;
        const tableUnidades = schema.unidades as any;
        const tablePessoas = schema.pessoas as any;
        const tableEnderecos = schema.enderecos as any;

        const isUpdate = !!dto.id;
        const tenantId = dto.id;

        const payloadTenant = {
          nome_conta: dto.nome_conta,
          nome_fantasia: dto.nome_fantasia || dto.nome_conta,
          url_logo: dto.url_logo || null,
          slug: dto.slug,
          email_financeiro: dto.email_financeiro,
          telefone: dto.telefone || null,
          status: 'ativo',
          version_schema: '1.0.1',
          updated_at: new Date(),
        };

        // A. SALVA OU ATUALIZA IMOBILIÁRIA
        if (isUpdate) {
          await tx
            .update(tableTenants)
            .set(payloadTenant)
            .where(eq(tableTenants.id, tenantId));
        } else {
          const [tenant] = await tx
            .insert(tableTenants)
            .values(payloadTenant)
            .returning();

          // B. SÓ CRIA MATRIZ E ADMIN SE FOR NOVA INCLUSÃO
          const [unidade] = await tx
            .insert(tableUnidades)
            .values({
              tenant_id: tenant.id,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            })
            .returning();

          const [pessoa] = await tx
            .insert(tablePessoas)
            .values({
              tenant_id: tenant.id,
              unidade_id: unidade.id,
              nome: dto.nomeDono || dto.nome_fantasia,
              email: dto.email || dto.email_financeiro,
              documento: dto.documento || '000.000.000-00',
              papel: '6',
              is_admin: true,
              cargo: 'ceo',
            })
            .returning();

          if (dto.endereco) {
            await tx.insert(tableEnderecos).values({
              pessoa_id: pessoa.id,
              ...dto.endereco,
            });
          }
        }

        return { success: true };
      } catch (e: any) {
        console.error('❌ [ONBOARDING ERROR]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  /**
   * 4. EXCLUSÃO REAL
   */
  async removerTenant(id: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const table = schema.tenants as any;
        await tx.delete(table).where(eq(table.id, id));
        return { success: true };
      } catch (e: any) {
        throw new InternalServerErrorException(
          'Existem dados vinculados a esta imobiliária.',
        );
      }
    });
  }
}
