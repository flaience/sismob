// apps/api/src/saas/saas.service.ts
import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, sql, or } from 'drizzle-orm';
import { buscarEnderecoVinculado } from '../common/utils/address-resolver';
import { persistirEnderecoLego } from '../common/utils/address-factory';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SaasService {
  private supabaseAdmin;
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }

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

  // apps/api/src/saas/saas.service.ts

  async listarTenants() {
    try {
      // Usamos ALIAS (as) para garantir que o JS leia o nome certo das colunas
      const res = await this.db.execute(sql`
      SELECT 
        id, 
        nome_fantasia as "nome_fantasia", 
        nome_conta as "nome_conta", 
        telefone as "telefone", 
        email_financeiro as "email_financeiro", 
        status 
      FROM tenants 
      ORDER BY created_at DESC
    `);

      const rows = res.rows || res;
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      return [];
    }
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
      nomeDono: row.nomeDono || '',
      endereco: {
        id: row.endereco_id, // <--- OBRIGATÓRIO PARA O UPDATE FUNCIONAR
        cep: row.cep || '',
        logradouro: row.logradouro || '',
        numero: row.numero || '',
        bairro: row.bairro || '',
        cidade: row.cidade || '',
        estado: row.estado || '',
      },
    };
  }
  /**
   * 3. MOTOR DE ONBOARDING (Inclusão e Alteração Inteligente)
   */

  async onboarding(dto: any) {
    // 1. LOG DE ENTRADA: O que o formulário está mandando?
    console.log('📦 [SISMOB DEBUG] DTO RECEBIDO:', JSON.stringify(dto));

    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined' && dto.id !== '';

        // 🚀 LEGO: O ID do endereço pode vir em 'endereco_id' ou 'endereco.id'
        const idDoEndereco = dto.endereco_id || dto.endereco?.id;
        const enderecoId = await persistirEnderecoLego(
          tx,
          dto.endereco,
          idDoEndereco,
        );

        if (isUpdate) {
          const tablePessoas = schema.pessoas as any;

          // 2. BUSCA O DONO ATUAL
          const donos = await tx
            .select()
            .from(tablePessoas)
            .where(
              and(
                eq(tablePessoas.tenant_id, dto.id),
                eq(tablePessoas.papel, '6'),
              ),
            )
            .limit(1);

          const donoAtual = donos[0];

          // 3. ATUALIZAÇÃO DO LOGIN (SUPABASE AUTH)
          if (donoAtual && dto.email_financeiro !== donoAtual.email) {
            console.log(
              `📧 [SISMOB] Tentando trocar e-mail de login: ${donoAtual.id}`,
            );

            const { data: updateData, error: authError } =
              await this.supabaseAdmin.auth.admin.updateUserById(donoAtual.id, {
                email: dto.email_financeiro,
                email_confirm: true,
              });

            if (authError) {
              // 🚨 AQUI VOCÊ VERÁ O ERRO REAL NO RAILWAY (Ex: "Email already in use" ou "User not found")
              console.error(
                '❌ [SUPABASE AUTH ERROR]:',
                JSON.stringify(authError),
              );
              throw new Error(`Erro no Cofre de Senhas: ${authError.message}`);
            }
            console.log('✅ [SISMOB] Login do dono atualizado no Supabase.');
          }

          // 4. ATUALIZA O TENANT (SQL BRUTO PARA NÃO FALHAR)
          await tx.execute(sql`
          UPDATE tenants SET 
            nome_fantasia = ${dto.nome_fantasia},
            nome_conta = ${dto.nome_conta},
            telefone = ${dto.telefone},
            email_financeiro = ${dto.email_financeiro},
            slug = ${dto.slug},
            url_logo = ${dto.url_logo},
            endereco_id = ${enderecoId},
            updated_at = NOW()
          WHERE id = ${dto.id}
        `);

          // 5. ATUALIZA A PESSOA (DONO)
          await tx
            .update(tablePessoas)
            .set({
              nome: dto.nomeDono || dto.nome_fantasia,
              email: dto.email_financeiro,
              endereco_id: enderecoId,
            })
            .where(
              and(
                eq(tablePessoas.tenant_id, dto.id),
                eq(tablePessoas.papel, '6'),
              ),
            );

          return { success: true, id: dto.id };
        } else {
          // ... (Seu código de Insert que já está funcionando)
        }
      } catch (e) {
        console.error('❌ [SISMOB FATAL ERROR]:', e.message);
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
  // apps/api/src/saas/saas.service.ts

  // apps/api/src/saas/saas.service.ts

  // apps/api/src/saas/saas.service.ts

  async removerTenant(id: string) {
    try {
      console.log(`💣 [SISMOB] Iniciando exclusão total do Tenant: ${id}`);

      // 1. BUSCA TODOS OS USUÁRIOS DA IMOBILIÁRIA
      // Precisamos dos IDs antes de deletar no banco, pois os IDs do banco = IDs do Auth
      const tablePessoas = schema.pessoas as any;
      const usuarios = await this.db
        .select({ id: tablePessoas.id })
        .from(tablePessoas)
        .where(eq(tablePessoas.tenant_id, id));

      console.log(
        `👥 [SISMOB] Removendo ${usuarios.length} acessos no Supabase Auth...`,
      );

      // 2. DELETA CADA USUÁRIO NO COFRE DO SUPABASE AUTH
      for (const user of usuarios) {
        const { error } = await this.supabaseAdmin.auth.admin.deleteUser(
          user.id,
        );
        if (error) {
          // Se der erro porque o usuário já não existia no Auth, ignoramos e seguimos
          console.warn(
            `⚠️ [SISMOB] Usuário ${user.id} não encontrado no Auth ou erro:`,
            error.message,
          );
        } else {
          console.log(`✅ [SISMOB] Acesso Auth removido: ${user.id}`);
        }
      }

      // 3. AGORA SIM, DELETA O TENANT NO BANCO DE DADOS
      // O seu banco já tem o CASCADE que configuramos, então isso vai limpar tudo
      const tableTenants = schema.tenants as any;
      await this.db.delete(tableTenants).where(eq(tableTenants.id, id));

      console.log(
        '🏁 [SISMOB] Tenant e todos os acessos deletados com sucesso.',
      );
      return { success: true };
    } catch (e) {
      console.error(
        '❌ [SISMOB FATAL] Falha na exclusão sincronizada:',
        e.message,
      );
      throw new InternalServerErrorException(
        'Falha ao remover imobiliária e seus acessos. ' + e.message,
      );
    }
  }
}
