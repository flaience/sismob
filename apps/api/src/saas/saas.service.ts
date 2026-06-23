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
  // async onboarding(dto: any) {
  //   console.log('📦 [SISMOB DEBUG] DTO Recebido:', JSON.stringify(dto));

  //   return await this.db.transaction(async (tx: any) => {
  //     try {
  //       const isUpdate = dto.id && dto.id !== 'undefined' && dto.id !== '';

  //       // 1. OBTEMOS O ID DO ENDEREÇO (Pode vir na raiz do DTO ou dentro do objeto endereco)
  //       const idDoEndereco = dto.endereco_id || dto.endereco?.id;

  //       // 2. PERSISTÊNCIA LEGO
  //       const enderecoId = await persistirEnderecoLego(
  //         tx,
  //         dto.endereco,
  //         idDoEndereco,
  //       );

  //       if (isUpdate) {
  //         // UPDATE TENANT
  //         await tx.execute(sql`
  //         UPDATE tenants SET
  //           nome_fantasia = ${dto.nome_fantasia},
  //           telefone = ${dto.telefone},
  //           endereco_id = ${enderecoId}, -- Mantém o vínculo
  //           updated_at = NOW()
  //         WHERE id = ${dto.id}
  //       `);

  //         // Atualiza o Dono (Pessoa Papel 6)
  //         const tablePessoas = schema.pessoas as any;
  //         await tx
  //           .update(tablePessoas)
  //           .set({ nome: dto.nomeDono, email: dto.email_financeiro })
  //           .where(
  //             and(
  //               eq(tablePessoas.tenant_id, dto.id),
  //               eq(tablePessoas.papel, '6'),
  //             ),
  //           );

  //         return { success: true, id: dto.id };
  //       } else {
  //         // INSERT COM SQL BRUTO
  //         const res = await tx.execute(sql`
  //         INSERT INTO tenants
  //         (nome_conta, nome_fantasia, telefone, email_financeiro, slug, url_logo, endereco_id, status)
  //         VALUES
  //         (${dto.nome_conta}, ${dto.nome_fantasia}, ${dto.telefone}, ${dto.email_financeiro}, ${dto.slug}, ${dto.url_logo}, ${enderecoId}, 'ativo')
  //         RETURNING id
  //       `);

  //         // 🛡️ CAPTURA DE ID RESILIENTE (Resolve o erro do undefined '0')
  //         const rows = res.rows || res;
  //         const tenantId = rows[0]?.id || rows[0]?.id_tenant; // Tenta as variações comuns

  //         if (!tenantId) {
  //           throw new Error(
  //             'Falha ao recuperar o ID da imobiliária após o insert.',
  //           );
  //         }

  //         console.log('✅ [SISMOB DEBUG] Tenant Criado ID:', tenantId);

  //         // 2. CRIAÇÃO DA MATRIZ
  //         const tableUnidades = schema.unidades as any;
  //         const [unidade] = await tx
  //           .insert(tableUnidades)
  //           .values({
  //             tenant_id: tenantId,
  //             nome: 'MATRIZ',
  //             is_matriz: true,
  //           })
  //           .returning();

  //         // 3. CRIAÇÃO DO DONO (PAPEL 6)
  //         const tablePessoas = schema.pessoas as any;
  //         await tx.insert(tablePessoas).values({
  //           tenant_id: tenantId,
  //           unidade_id: unidade.id,
  //           nome: dto.nomeDono || dto.nome_fantasia,
  //           email: dto.email_financeiro,
  //           papel: '6',
  //           documento: '000.000.000-00',
  //           endereco_id: enderecoId,
  //         });

  //         return { success: true, id: tenantId };
  //       }
  //     } catch (e) {
  //       console.error('❌ [SISMOB FATAL] Erro no fluxo Onboarding:', e.message);
  //       throw new InternalServerErrorException(e.message);
  //     }
  //   });
  // }

  // apps/api/src/saas/saas.service.ts

  async onboarding(dto: any) {
    console.log(
      '📦 [SISMOB DEBUG] Iniciando Onboarding para:',
      dto.nome_fantasia,
    );

    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined' && dto.id !== '';

        // 1. ENDEREÇO LEGO (Ordem Industrial)
        const idDoEndereco = dto.endereco_id || dto.endereco?.id;
        const enderecoId = await persistirEnderecoLego(
          tx,
          dto.endereco,
          idDoEndereco,
        );

        if (isUpdate) {
          // ... (Mantenha seu código de UPDATE que já funciona)
          return { success: true, id: dto.id };
        } else {
          // 🚀 CRIAÇÃO DE NOVA IMOBILIÁRIA (CENÁRIO ONDE DEU ERRO)

          // A. INSERT DO TENANT
          const resTenant = await tx.execute(sql`
          INSERT INTO tenants 
          (nome_conta, nome_fantasia, telefone, email_financeiro, slug, url_logo, endereco_id, status)
          VALUES 
          (${dto.nome_conta}, ${dto.nome_fantasia}, ${dto.telefone}, ${dto.email_financeiro}, ${dto.slug}, ${dto.url_logo}, ${enderecoId}, 'ativo')
          RETURNING id
        `);

          const rows = resTenant.rows || resTenant;
          const tenantId = rows[0]?.id;

          // B. CRIAÇÃO DO USUÁRIO NO SUPABASE AUTH
          // 💡 Se o usuário já existir no Auth, o catch abaixo vai pegar e te avisar
          const { data: authUser, error: authError } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email_financeiro,
              password: 'Sismob@2026',
              email_confirm: true,
            });

          if (authError) {
            throw new Error(
              `Erro no Supabase Auth: ${authError.message}. (Dica: Verifique se o e-mail já existe na aba Authentication do Supabase)`,
            );
          }

          // C. CRIAÇÃO DA MATRIZ
          const [unidade] = await tx
            .insert(schema.unidades as any)
            .values({
              tenant_id: tenantId,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            })
            .returning();

          // D. CRIAÇÃO DO DONO (PAPEL 6)
          // 🛡️ BLINDAGEM DE DOCUMENTO: Usamos o nome_conta (CNPJ) se o documento vier vazio
          const documentoDono =
            dto.documento || dto.nome_conta || '000.000.000-00';

          await tx.insert(schema.pessoas as any).values({
            id: authUser.user.id, // Vínculo com o Auth
            tenant_id: tenantId,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_fantasia,
            email: dto.email_financeiro,
            documento: documentoDono, // <--- NUNCA MAIS SERÁ NULO
            papel: '6',
            is_admin: true,
            endereco_id: enderecoId,
          });

          return { success: true, id: tenantId };
        }
      } catch (e) {
        console.error('❌ [SISMOB FATAL] Erro no Onboarding:', e.message);
        // Aqui devolvemos a mensagem amigável para o seu alert() no frontend
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
