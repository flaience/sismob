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
    const res = await this.db.execute(sql`
    SELECT id, nome_fantasia, telefone, email_financeiro, nome_conta, status 
    FROM tenants ORDER BY created_at DESC
  `);
    return res.rows || res;
  }
  /**
   * 2. BUSCA ÚNICA (Para o formulário de alteração)
   * Usa o seu Resolutor de Endereço Universal
   */

  async buscarUmTenant(id: string) {
    const res = await this.db.execute(sql`
    SELECT t.*, p.nome as "nomeDono", e.cep, e.logradouro, e.numero, e.bairro, e.cidade, e.estado
    FROM tenants t
    LEFT JOIN pessoas p ON p.tenant_id = t.id AND p.papel = '6'
    LEFT JOIN enderecos e ON e.id = t.endereco_id
    WHERE t.id = ${id} LIMIT 1
  `);
    const row = (res.rows || res)[0];
    if (!row) return null;

    return {
      ...row,
      endereco: {
        cep: row.cep,
        logradouro: row.logradouro,
        numero: row.numero,
        bairro: row.bairro,
        cidade: row.cidade,
        estado: row.estado,
      },
    };
  }
  /**
   * 3. MOTOR DE ONBOARDING (Inclusão e Alteração Inteligente)
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined';
        const tableTenants = schema.tenants as any;
        const tablePessoas = schema.pessoas as any;

        // 🚀 1. GRAVAÇÃO LEGO (A Ordem que você definiu)
        // O FormMaster envia dto.endereco.cep, etc.
        const enderecoId = await persistirEnderecoLego(
          tx,
          dto.endereco,
          dto.endereco_id,
        );

        const payloadTenant = {
          nome_conta: dto.nome_conta,
          nome_fantasia: dto.nome_fantasia,
          url_logo: dto.url_logo,
          slug: dto.slug,
          email_financeiro: dto.email_financeiro,
          telefone: dto.telefone,
          endereco_id: enderecoId, // <--- O VÍNCULO AGORA VAI PREENCHIDO
          status: dto.status || 'ativo',
        };

        if (isUpdate) {
          await tx
            .update(tableTenants)
            .set(payloadTenant)
            .where(eq(tableTenants.id, dto.id));

          // Atualiza o Dono (Papel 6)
          await tx
            .update(tablePessoas)
            .set({ nome: dto.nomeDono, email: dto.email_financeiro })
            .where(
              and(
                eq(tablePessoas.tenant_id, dto.id),
                eq(tablePessoas.papel, '6'),
              ),
            );

          return { success: true, id: dto.id };
        } else {
          // Cria Novo Tenant
          const [tenant] = await (
            tx.insert(tableTenants).values(payloadTenant) as any
          ).returning();

          // Cria Unidade Matriz
          const [unidade] = await (
            tx.insert(schema.unidades as any).values({
              tenant_id: tenant.id,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            }) as any
          ).returning();

          // Cria Dono (Papel 6)
          await (tx.insert(tablePessoas).values({
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_fantasia,
            email: dto.email_financeiro,
            documento: '000.000.000-00',
            papel: '6',
            is_admin: true,
            endereco_id: enderecoId,
          }) as any);

          return { success: true, id: tenant.id };
        }
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
      S;
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Existem registros vinculados a esta imobiliária.',
      );
    }
  }
}
