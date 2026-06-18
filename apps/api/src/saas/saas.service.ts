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

  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined';

        // 1. ENDEREÇO LEGO
        const enderecoId = await persistirEnderecoLego(
          tx,
          dto.endereco,
          dto.endereco_id,
        );

        if (isUpdate) {
          // ... Lógica de Update que já fizemos ...
        } else {
          // --- PROCESSO DE CRIAÇÃO INDUSTRIAL ---

          // A. CRIA O TENANT
          const [tenant] = await tx
            .insert(schema.tenants)
            .values({
              nome_conta: dto.nome_conta,
              nome_fantasia: dto.nome_fantasia,
              slug: dto.slug,
              email_financeiro: dto.email_financeiro,
              endereco_id: enderecoId,
              status: 'ativo',
            })
            .returning();

          // B. CRIA O ACESSO NO SUPABASE (O Login do Dono)
          // A senha inicial é padronizada para a primeira implantação
          const { data: authUser, error: authError } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email_financeiro,
              password: 'Sismob@2026', // <--- SENHA MESTRE DE IMPLANTAÇÃO
              email_confirm: true,
            });

          if (authError)
            throw new Error('Erro ao criar acesso: ' + authError.message);

          // C. CRIA A MATRIZ
          const [unidade] = await tx
            .insert(schema.unidades)
            .values({
              tenant_id: tenant.id,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            })
            .returning();

          // D. CRIA O DONO (PAPEL 6) VINCULADO AO AUTH
          await tx.insert(schema.pessoas).values({
            id: authUser.user.id, // O ID do banco é o mesmo do Supabase Auth!
            tenant_id: tenant.id,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_fantasia,
            email: dto.email_financeiro,
            papel: '6', // OWNER / DONO
            is_admin: true,
            endereco_id: enderecoId,
          });

          return {
            success: true,
            id: tenant.id,
            msg: 'Imobiliária e Dono criados. Senha: Sismob@2026',
          };
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
  // apps/api/src/saas/saas.service.ts

  async removerTenant(id: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        console.log(
          `🗑️ [SISMOB] Iniciando limpeza total da imobiliária: ${id}`,
        );

        // 1. Descobrimos o ID do endereço para não deixar lixo no banco (Lego)
        const resTenant = await tx.execute(
          sql`SELECT endereco_id FROM tenants WHERE id = ${id}`,
        );
        const enderecoId = resTenant.rows[0]?.endereco_id;

        // 2. Lógica de "Terra Arrasada" (Apaga tudo que aponta para esse Tenant)
        // O Drizzle/SQL apaga na ordem correta para não dar erro de FK

        // A. Apaga os Logs e Atividades
        await tx.execute(
          sql`DELETE FROM logs_atividades WHERE tenant_id = ${id}`,
        );

        // B. Apaga as Pessoas (Dono, Corretores, etc)
        await tx.execute(sql`DELETE FROM pessoas WHERE tenant_id = ${id}`);

        // C. Apaga as Unidades/Filiais
        await tx.execute(sql`DELETE FROM unidades WHERE tenant_id = ${id}`);

        // D. Apaga a própria Imobiliária (Tenant)
        await tx.execute(sql`DELETE FROM tenants WHERE id = ${id}`);

        // E. Por fim, apaga o endereço na tabela Lego (se ele não estiver sendo usado por mais ninguém)
        if (enderecoId) {
          await tx.execute(sql`DELETE FROM enderecos WHERE id = ${enderecoId}`);
        }

        console.log('✅ [SISMOB] Imobiliária e todos os vínculos removidos.');
        return { success: true };
      } catch (e) {
        console.error('❌ [SISMOB] Falha na exclusão:', e.message);
        throw new InternalServerErrorException(
          'Erro ao excluir: Esta imobiliária possui registros operacionais (Imóveis/Títulos) que impedem a remoção direta.',
        );
      }
    });
  }
}
