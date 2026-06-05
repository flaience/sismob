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
      console.error('❌ Erro ao listar tenants:', e);
      return [];
    }
  }

  // 2. BUSCA ÚNICA (Para carregar o formulário de alteração)
  async buscarUmTenant(id: string) {
    try {
      console.log(`🔍 [SISMOB] Buscando imobiliária e endereço: ${id}`);

      // SQL NUCLEAR COM JOIN: Busca Imobiliária + Endereço do Dono (Papel 6)
      const res = await this.db.execute(sql`
        SELECT 
          t.*,
          e.cep, e.logradouro, e.numero, e.bairro, e.cidade, e.estado
        FROM tenants t
        LEFT JOIN pessoas p ON p.tenant_id = t.id AND p.papel = '6'
        LEFT JOIN enderecos e ON e.pessoa_id = p.id
        WHERE t.id = ${id}
        LIMIT 1
      `);

      const rows = res.rows || res;
      if (!rows || rows.length === 0) return null;

      const row = rows[0];

      // FORMATAÇÃO INDUSTRIAL:
      // Pegamos as colunas soltas e colocamos dentro do objeto 'endereco'
      // que o seu SismobFormMaster espera.
      return {
        ...row,
        endereco: {
          cep: row.cep || '',
          logradouro: row.logradouro || '',
          numero: row.numero || '',
          bairro: row.bairro || '',
          cidade: row.cidade || '',
          estado: row.estado || '',
        },
      };
    } catch (e: any) {
      console.error('❌ Erro ao buscar imobiliária completa:', e.message);
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
        const isUpdate = dto.id && dto.id !== 'undefined';
        let tenantId = dto.id;

        const tablePessoas = schema.pessoas as any;
        const tableEnderecos = schema.enderecos as any;
        const tableUnidades = schema.unidades as any;

        if (isUpdate) {
          // UPDATE NUCLEAR
          await tx.execute(sql`
            UPDATE tenants SET 
              nome_conta = ${dto.nome_conta}, nome_fantasia = ${dto.nome_fantasia},
              url_logo = ${dto.url_logo || null}, slug = ${dto.slug},
              email_financeiro = ${dto.email_financeiro}, telefone = ${dto.telefone},
              updated_at = NOW()
            WHERE id = ${tenantId}
          `);
        } else {
          // INSERT NUCLEAR
          const resTenant = await tx.execute(sql`
            INSERT INTO tenants (nome_conta, nome_fantasia, url_logo, slug, email_financeiro, telefone, status, version_schema, updated_at)
            VALUES (${dto.nome_conta}, ${dto.nome_fantasia}, ${dto.url_logo || null}, ${dto.slug}, ${dto.email_financeiro}, ${dto.telefone}, 'ativo', '1.0.1', NOW())
            RETURNING id;
          `);
          tenantId = resTenant[0].id;

          // Cria Matriz e Admin
          const [unidade] = await tx
            .insert(tableUnidades)
            .values({
              tenant_id: tenantId,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            })
            .returning();

          await tx.insert(tablePessoas).values({
            tenant_id: tenantId,
            unidade_id: unidade.id,

            // Se o formulário não tem 'nomeDono', usamos o 'nome_fantasia'
            nome: dto.nomeDono || dto.nome_fantasia || dto.nome_conta,

            // O TIRO DE MISERICÓRDIA:
            // O formulário envia 'email_financeiro', então o DTO tem que ler 'email_financeiro'
            email: dto.email_financeiro,

            documento: dto.documento || '000.000.000-00',
            papel: '6',
            is_admin: true,
            cargo: 'ceo',
            updated_at: new Date(),
          });
        }

        // 4. SYNC DE ENDEREÇO
        if (dto.endereco) {
          const [admin] = await tx
            .select()
            .from(tablePessoas)
            .where(
              and(
                eq(tablePessoas.tenant_id, tenantId),
                eq(tablePessoas.papel, '6'),
              ),
            )
            .limit(1);

          if (admin) {
            await tx
              .delete(tableEnderecos)
              .where(eq(tableEnderecos.pessoa_id, admin.id));
            await tx
              .insert(tableEnderecos)
              .values({ pessoa_id: admin.id, ...dto.endereco });
          }
        }
        return { success: true, tenantId };
      } catch (e: any) {
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
