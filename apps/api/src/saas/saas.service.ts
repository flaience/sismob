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
      // O SELECT * via SQL puro ignora qualquer erro de versão de schema
      const res = await this.db.execute(
        sql`SELECT * FROM tenants ORDER BY created_at DESC`,
      );
      return res.rows || res;
    } catch (e) {
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA (Para o formulário de alteração)
   * Usa o seu Resolutor de Endereço Universal
   */

  async buscarUmTenant(id: string) {
    try {
      console.log(`🔎 [SISMOB DEBUG] Iniciando busca para o ID: ${id}`);

      // 1. Busca o Tenant (A Empresa)
      const resTenant = await this.db.execute(
        sql`SELECT * FROM tenants WHERE id = ${id} LIMIT 1`,
      );
      const tenant = resTenant.rows?.[0] || resTenant[0];

      if (!tenant) {
        console.error(
          `❌ [SISMOB DEBUG] Tenant não encontrado no banco para o ID: ${id}`,
        );
        return null;
      }

      console.log(`✅ [SISMOB DEBUG] Tenant localizado: ${tenant.nome_conta}`);

      // 2. Busca o Dono (Papel 6 ou 0)
      const resDono = await this.db.execute(sql`
        SELECT id, nome, email, documento FROM pessoas 
        WHERE tenant_id = ${id} AND (papel = '6' OR papel = '0') 
        LIMIT 1
      `);
      const dono = resDono.rows?.[0] || resDono[0];

      // 3. Busca o Endereço (Vinculado ao Dono)
      let endereco = {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
      };
      if (dono?.id) {
        const resEnd = await this.db.execute(
          sql`SELECT * FROM enderecos WHERE pessoa_id = ${dono.id} LIMIT 1`,
        );
        const endData = resEnd.rows?.[0] || resEnd[0];
        if (endData) endereco = endData;
      }

      // 4. MONTAGEM DO PACOTE FINAL
      const result = {
        ...tenant,
        nomeDono: dono?.nome || '',
        email: dono?.email || tenant.email_financeiro,
        documento: dono?.documento || '',
        endereco: endereco,
      };

      console.log(`📦 [SISMOB DEBUG] Objeto de retorno montado com sucesso.`);
      return result;
    } catch (e: any) {
      console.error(`❌ [SISMOB DEBUG] Erro fatal na busca:`, e.message);
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
        const tenantId = dto.id;
        const tableTenants = schema.tenants as any;
        const tablePessoas = schema.pessoas as any;
        const tableUnidades = schema.unidades as any;

        // 1. ENDEREÇO LEGO (Gravamos antes para ter o ID)
        const enderecoId = await persistirEnderecoLego(
          tx,
          dto.endereco,
          dto.endereco_id,
        );

        const payloadTenant = {
          nome_conta: dto.nome_conta,
          nome_fantasia: dto.nome_fantasia || dto.nome_conta,
          url_logo: dto.url_logo || null,
          slug: dto.slug,
          email_financeiro: dto.email_financeiro,
          telefone: dto.telefone || null,
          endereco_id: enderecoId, // <--- VINCULO LEGO
          status: 'ativo',
          version_schema: '1.0.1',
          updated_at: new Date(),
        };

        if (isUpdate) {
          await tx
            .update(tableTenants)
            .set(payloadTenant)
            .where(eq(tableTenants.id, tenantId));
          // Atualiza dados do dono
          await tx
            .update(tablePessoas)
            .set({ nome: dto.nomeDono, email: dto.email_financeiro })
            .where(
              and(
                eq(tablePessoas.tenant_id, tenantId),
                eq(tablePessoas.papel, '6'),
              ),
            );
        } else {
          const [tenant] = await tx
            .insert(tableTenants)
            .values(payloadTenant)
            .returning();
          const [unidade] = await tx
            .insert(tableUnidades)
            .values({
              tenant_id: tenant.id,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            })
            .returning();

          await tx.insert(tablePessoas).values({
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_fantasia,
            email: dto.email_financeiro,
            documento: dto.documento || '000.000.000-00',
            papel: '6',
            is_admin: true,
            cargo: 'ceo',
            endereco_id: enderecoId, // Dono compartilha o endereço da sede
          });
        }
        return { success: true };
      } catch (e: any) {
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
