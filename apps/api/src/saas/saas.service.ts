import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, sql, or } from 'drizzle-orm';
import { buscarEnderecoVinculado } from '../common/utils/address-resolver';
import { persistirEnderecoLego } from '../common/utils/address-factory';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async buscarPorHost(host: string) {
    if (!host || host === 'undefined') return null;
    const table = schema.tenants as any;
    const res = await this.db
      .select()
      .from(table)
      .where(
        or(
          eq(table.dominio_customizado, host),
          eq(table.slug, host.split('.')[0]),
        ),
      )
      .limit(1);
    return res[0] || null;
  }

  /**
   * 1. LISTAGEM GLOBAL (Para o Luis)
   */
  async listarTenants() {
    try {
      const res = await this.db.execute(sql`
        SELECT 
          id, 
          nome_fantasia, 
          nome_conta, 
          slug, 
          email_financeiro, 
          telefone, 
          status, 
          version_schema 
        FROM tenants 
        ORDER BY created_at DESC
      `);
      return res.rows || res;
    } catch (e) {
      console.error('❌ Erro ao listar imobiliárias:', e.message);
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA (Para o formulário de alteração)
   * Usa o seu Resolutor de Endereço Universal
   */

  // apps/api/src/saas/saas.service.ts

  // apps/api/src/saas/saas.service.ts

  // apps/api/src/saas/saas.service.ts

  async buscarUmTenant(id: string) {
    try {
      const res = await this.db.execute(sql`
        SELECT 
          t.*,
          p.nome as "nomeDono",
          e.cep, e.logradouro, e.numero, e.bairro, e.cidade, e.estado
        FROM tenants t
        LEFT JOIN pessoas p ON p.tenant_id = t.id AND (p.papel = '6' OR p.papel = '0')
        LEFT JOIN enderecos e ON e.id = t.endereco_id
        WHERE t.id = ${id}
        LIMIT 1
      `);

      const rows = res.rows || res;
      if (!rows || rows.length === 0) return null;

      const row = rows[0];

      // MONTAGEM INDUSTRIAL: Garante que as chaves batam com o mapa-modulos.ts
      return {
        id: row.id,
        nome_conta: row.nome_conta,
        nome_fantasia: row.nome_fantasia,
        url_logo: row.url_logo,
        slug: row.slug,
        email_financeiro: row.email_financeiro,
        telefone: row.telefone,
        status: row.status,
        nomeDono: row.nomeDono || '', // Mapeia para o campo nomeDono da seção 2
        endereco: {
          cep: row.cep || '',
          logradouro: row.logradouro || '',
          numero: row.numero || '',
          bairro: row.bairro || '',
          cidade: row.cidade || '',
          estado: row.estado || '',
        },
      };
    } catch (e) {
      console.error('❌ Erro ao buscar imobiliária:', e.message);
      return null;
    }
  }
  /**
   * 3. MOTOR DE ONBOARDING (Inclusão e Alteração Inteligente)
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined';

        // 1. Persistir Endereço Lego
        let enderecoId = dto.endereco_id;
        if (dto.endereco?.cep) {
          const dadosEnd = {
            cep: dto.endereco.cep,
            logradouro: dto.endereco.logradouro,
            numero: dto.endereco.numero,
            bairro: dto.endereco.bairro,
            cidade: dto.endereco.cidade,
            estado: dto.endereco.estado,
          };

          const tableEnd = schema.enderecos as any;
          if (enderecoId) {
            await tx
              .update(tableEnd)
              .set(dadosEnd)
              .where(eq(tableEnd.id, enderecoId));
          } else {
            const [novo] = await tx
              .insert(tableEnd)
              .values(dadosEnd)
              .returning();
            enderecoId = novo.id;
          }
        }

        const tableTenants = schema.tenants as any;
        const payloadTenant = {
          nome_conta: dto.nome_conta,
          nome_fantasia: dto.nome_fantasia,
          url_logo: dto.url_logo,
          slug: dto.slug,
          email_financeiro: dto.email_financeiro,
          telefone: dto.telefone,
          endereco_id: enderecoId,
          status: dto.status || 'ativo',
        };

        if (isUpdate) {
          await tx
            .update(tableTenants)
            .set(payloadTenant)
            .where(eq(tableTenants.id, dto.id));

          // Atualiza o Dono (Pessoa Papel 6)
          const tablePessoas = schema.pessoas as any;
          await tx
            .update(tablePessoas)
            .set({ nome: dto.nomeDono, email: dto.email_financeiro })
            .where(
              and(
                eq(tablePessoas.tenant_id, dto.id),
                eq(tablePessoas.papel, '6'),
              ),
            );
        } else {
          // Cria Novo
          const [tenant] = await tx
            .insert(tableTenants)
            .values(payloadTenant)
            .returning();

          // Cria Unidade Matriz
          const [unidade] = await tx
            .insert(schema.unidades as any)
            .values({
              tenant_id: tenant.id,
              nome: 'MATRIZ',
              is_matriz: true,
            })
            .returning();

          // Cria Dono
          await tx.insert(schema.pessoas as any).values({
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono,
            email: dto.email_financeiro,
            papel: '6',
            documento: '000.000.000-00',
            endereco_id: enderecoId,
          });
        }
        return { success: true };
      } catch (e) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  async findOne(id: number, tenantId: string) {
    const table = schema.imoveis as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
      .limit(1);

    // O .select() sem parâmetros traz logradouro, bairro, cidade, etc.
    return results[0] || null;
  }
  /**
   * 4. EXCLUSÃO (O QUE FALTAVA)
   * Resolve o erro TS2339 no Controller
   */
  async removerTenant(id: string) {
    try {
      const table = schema.tenants as any;
      // O banco fará o delete em cascata se configurado no schema
      return await this.db.delete(table).where(eq(table.id, id));
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Existem registros vinculados a esta imobiliária.',
      );
    }
  }
}
