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
   * 1. LISTAGEM GLOBAL (Para o Luis)
   */
  // 1. LISTAGEM DO GRID (Mata o erro de campo vazio no Grid)
  async listarTenants() {
    try {
      // O SEGREDO: Usamos SQL puro para o Drizzle não filtrar colunas "novas"
      const res = await this.db.execute(
        sql`SELECT * FROM tenants ORDER BY created_at DESC`,
      );
      return res.rows || res;
    } catch (e) {
      return [];
    }
  }

  // 2. BUSCA ÚNICA (Mata o erro de formulário de edição vazio)
  async buscarUmTenant(id: string) {
    try {
      const res = await this.db.execute(
        sql`SELECT * FROM tenants WHERE id = ${id} LIMIT 1`,
      );
      const data = res.rows || res;

      if (data.length === 0) return null;

      // Retorna o objeto completo para o formulário
      return data[0];
    } catch (e) {
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

        // 1. GRAVAÇÃO DO TENANT (Imobiliária)
        const [tenant] = await tx
          .insert(tableTenants)
          .values({
            nome_conta: dto.nome_conta || dto.nomeEmpresa,
            nome_fantasia: dto.nome_fantasia || dto.nome_conta,
            url_logo: dto.url_logo || null,
            slug: dto.slug,
            email_financeiro: dto.email_financeiro || dto.email,
            telefone: dto.telefone || null,
            status: 'ativo',
            version_schema: '1.0.1',
          })
          .returning();

        // 2. GERAÇÃO DA MATRIZ
        const [unidade] = await tx
          .insert(tableUnidades)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning();

        // 3. CRIAÇÃO DO PROPRIETÁRIO (Admin)
        await tx.insert(tablePessoas).values({
          tenant_id: tenant.id,
          unidade_id: unidade.id,
          nome: dto.nomeDono || dto.nome_fantasia,
          email: dto.email || dto.email_financeiro,
          documento: dto.documento || '000.000.000-00',
          papel: '6',
          is_admin: true,
          cargo: 'ceo',
          updated_at: new Date(),
        });

        return { success: true, tenantId: tenant.id };
      } catch (e: any) {
        console.error('❌ [ONBOARDING ERROR]:', e.message);
        throw new InternalServerErrorException(`Erro no Banco: ${e.message}`);
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
