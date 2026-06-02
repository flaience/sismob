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
        console.log('🏭 [SISMOB v170] Iniciando Injeção SQL Direta...');

        // 1. GRAVAÇÃO DO TENANT (MODO NUCLEAR - Bypass de Schema)
        // Usamos SQL puro para garantir que o Postgres receba 'nome_fantasia' e 'telefone'
        const resTenant = await tx.execute(sql`
          INSERT INTO tenants (nome_conta, nome_fantasia, url_logo, slug, email_financeiro, telefone, status, version_schema, updated_at)
          VALUES (
            ${dto.nome_conta || dto.nomeEmpresa}, 
            ${dto.nome_fantasia || dto.nome_conta}, 
            ${dto.url_logo || null}, 
            ${dto.slug}, 
            ${dto.email_financeiro || dto.email}, 
            ${dto.telefone || null}, 
            'ativo', 
            '1.0.1', 
            NOW()
          )
          RETURNING id, slug;
        `);

        const tenant = resTenant.rows[0];

        // 2. GERAÇÃO DA MATRIZ
        const [unidade] = await tx
          .insert(schema.unidades as any)
          .values({
            tenant_id: tenant.id,
            nome: 'MATRIZ - CENTRAL',
            is_matriz: true,
          })
          .returning();

        // 3. CRIAÇÃO DO ADMIN (PROPRIETÁRIO)
        const [pessoa] = await tx
          .insert(schema.pessoas as any)
          .values({
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_fantasia,
            email: dto.email || dto.email_financeiro,
            documento: dto.documento || '000.000.000-00',
            papel: '6',
            is_admin: true,
            cargo: 'ceo',
            updated_at: new Date(),
          })
          .returning();

        // 4. GRAVAÇÃO DO ENDEREÇO
        if (dto.endereco) {
          await tx.insert(schema.enderecos as any).values({
            pessoa_id: pessoa.id,
            ...dto.endereco,
          });
        }

        console.log(
          `✅ [SISMOB] Sucesso! Imobiliária ${tenant.slug} gravada com todos os campos.`,
        );
        return { success: true, tenantId: tenant.id };
      } catch (e: any) {
        console.error('❌ [ONBOARDING FATAL v170]:', e.message);
        throw new InternalServerErrorException(
          `Falha na gravação industrial: ${e.message}`,
        );
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
