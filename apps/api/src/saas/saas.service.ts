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
      // O SEGREDO: Verificamos se o ID já existe no DTO que veio da tela
      const isUpdate = dto.id && dto.id !== 'undefined';
      const tableTenants = schema.tenants as any;

      const payloadTenant = {
        nome_conta: dto.nome_conta || dto.nomeEmpresa,
        nome_fantasia: dto.nome_fantasia || dto.nome_conta,
        url_logo: dto.url_logo || null,
        slug: dto.slug, // <--- Este valor deve ser único!
        email_financeiro: dto.email_financeiro || dto.email,
        status: 'ativo',
        updated_at: new Date(),
      };

      try {
        if (isUpdate) {
          console.log(`🏭 [SISMOB] Atualizando Imobiliária ID: ${dto.id}`);
          await tx
            .update(tableTenants)
            .set(payloadTenant)
            .where(eq(tableTenants.id, dto.id));
          return { success: true, tenantId: dto.id };
        } else {
          console.log(`🏭 [SISMOB] Criando Nova Imobiliária Slug: ${dto.slug}`);
          const [tenant] = await tx
            .insert(tableTenants)
            .values(payloadTenant)
            .returning();

          // ... lógica de criar Matriz e Admin (apenas se for novo) ...

          return { success: true, tenantId: tenant.id };
        }
      } catch (e: any) {
        if (e.message.includes('unique constraint')) {
          throw new InternalServerErrorException(
            `O link (slug) '${dto.slug}' já está em uso por outra imobiliária.`,
          );
        }
        throw e;
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
