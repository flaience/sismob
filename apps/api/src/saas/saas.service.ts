import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, desc, sql } from 'drizzle-orm';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. LISTAGEM GLOBAL (Para o Luis)
   */
  // 1. LISTAGEM DO GRID (Mata o erro de campo vazio no Grid)
  // 1. LISTAGEM (Para o Grid)
  async listarTenants() {
    try {
      // O SEGREDO: SQL Puro garante que 'nome_fantasia' e 'telefone' cheguem à tela
      const res = await this.db.execute(
        sql`SELECT * FROM tenants ORDER BY created_at DESC`,
      );

      // O driver 'postgres.js' retorna os dados diretamente ou em .rows
      const data = res.rows || res;
      console.log(
        `📡 [SISMOB] Grid carregado com ${data.length} imobiliárias.`,
      );
      return data;
    } catch (e) {
      return [];
    }
  }

  // 2. BUSCA ÚNICA (Para carregar o formulário de alteração)
  async buscarUmTenant(id: string) {
    try {
      console.log(`🔍 [SISMOB] Buscando imobiliária ID: ${id}`);

      const res = await this.db.execute(
        sql`SELECT * FROM tenants WHERE id = ${id} LIMIT 1`,
      );
      const rows = res.rows || res;

      if (!rows || rows.length === 0) return null;

      // Retorna o objeto puro (sem colchetes) para o formulário
      return rows[0];
    } catch (e: any) {
      console.error('❌ Erro ao buscar imobiliária:', e.message);
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
        console.log('🔥 [SISMOB v180] MODO NUCLEAR ATIVO');

        // 1. INSERÇÃO VIA SQL PURO (Garante que Fantasia e Telefone entrem)
        const query = sql`
          INSERT INTO tenants (nome_conta, nome_fantasia, url_logo, slug, email_financeiro, telefone, status, version_schema, updated_at)
          VALUES (
            ${dto.nome_conta || dto.nomeEmpresa}, 
            ${dto.nome_fantasia}, 
            ${dto.url_logo || null}, 
            ${dto.slug}, 
            ${dto.email_financeiro}, 
            ${dto.telefone}, 
            'ativo', 
            '1.0.1', 
            NOW()
          )
          RETURNING id;
        `;

        const result = await tx.execute(query);

        // O SEGREDO DO ERRO ANTERIOR: O retorno no Postgres.js é direto o array
        const tenantId = result[0].id;

        // 2. GERAÇÃO DA MATRIZ
        await tx.insert(schema.unidades as any).values({
          tenant_id: tenantId,
          nome: 'MATRIZ - CENTRAL',
          is_matriz: true,
        });

        // 3. CRIAÇÃO DO ADMIN
        const [pessoa] = await tx
          .insert(schema.pessoas as any)
          .values({
            tenant_id: tenantId,
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

        return { success: true, tenantId };
      } catch (e: any) {
        console.error('❌ [SISMOB FATAL v180]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }
  // LISTAGEM COM SELECT * (Garante que Fantasia apareça no Grid)

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
