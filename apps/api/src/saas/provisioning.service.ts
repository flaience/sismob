//src/saas/provisioning.service.ts
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';
import { generateTemporaryPassword } from './utils/temporary-password';

type ProdutoFlaience = {
  id: string;
  cliente_id: string;
  produto: 'sisag' | 'sismob';
  situacao: 'ativo' | 'inativo';
  provisionamento_status: 'pendente' | 'processando' | 'concluido' | 'erro';
  tenant_id?: string | null;
  auth_user_id?: string | null;
};

type ClienteFlaience = {
  id: string;
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  fone?: string | null;
  whatsapp?: string | null;
};

@Injectable()
export class ProvisioningService {
  private readonly flaienceAdmin: SupabaseClient;
  private readonly sismobAdmin: SupabaseClient;

  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {
    const flaienceUrl = process.env.FLAIENCE_SUPABASE_URL;
    const flaienceKey = process.env.FLAIENCE_SUPABASE_SERVICE_ROLE_KEY;

    const sismobUrl =
      process.env.SISMOB_SUPABASE_URL || process.env.SUPABASE_URL;

    const sismobKey =
      process.env.SISMOB_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!flaienceUrl || !flaienceKey) {
      throw new Error(
        'FLAIENCE_SUPABASE_URL ou FLAIENCE_SUPABASE_SERVICE_ROLE_KEY não configurada.',
      );
    }

    if (!sismobUrl || !sismobKey) {
      throw new Error(
        'SISMOB_SUPABASE_URL ou SISMOB_SUPABASE_SERVICE_ROLE_KEY não configurada.',
      );
    }

    this.flaienceAdmin = createClient(flaienceUrl, flaienceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    this.sismobAdmin = createClient(sismobUrl, sismobKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async provisionarProdutoSismob(clienteProdutoId: string) {
    let authUserId: string | null = null;
    let tenantId: string | null = null;

    try {
      const produto = await this.buscarProduto(clienteProdutoId);

      this.validarProduto(produto);

      const cliente = await this.buscarCliente(produto.cliente_id);

      await this.atualizarProduto(clienteProdutoId, {
        provisionamento_status: 'processando',
        ultimo_erro: null,
      });

      tenantId = randomUUID();

      const senhaTemporaria = generateTemporaryPassword();

      const slug = await this.gerarSlugUnico(cliente.nome_fantasia);

      // ========================================
      // 1. CRIA O USUÁRIO NO SUPABASE AUTH
      // ========================================

      const { data: authData, error: authError } =
        await this.sismobAdmin.auth.admin.createUser({
          email: cliente.email,
          password: senhaTemporaria,
          email_confirm: true,
          user_metadata: {
            nome: cliente.nome,
            nome_fantasia: cliente.nome_fantasia,
            tenant_id: tenantId,
            papel: '6',
            produto: 'sismob',
          },
        });

      if (authError || !authData.user) {
        throw new Error(
          authError?.message ||
            'Não foi possível criar o usuário no Supabase Auth.',
        );
      }

      authUserId = authData.user.id;

      // ========================================
      // 2. CRIA O TENANT, UNIDADE E OWNER
      // ========================================

      await this.db.transaction(async (tx) => {
        const tenantsTable = schema.tenants as any;
        const unidadesTable = schema.unidades as any;
        const pessoasTable = schema.pessoas as any;

        const [tenant] = await tx
          .insert(tenantsTable)
          .values({
            id: tenantId,
            nome_conta: cliente.nome_fantasia,
            nome_fantasia: cliente.nome_fantasia,
            slug,
            status: 'ativo',
            email_financeiro: cliente.email,
            telefone: cliente.whatsapp || cliente.fone || null,
            endereco_id: null,
          })
          .returning();

        if (!tenant) {
          throw new Error('Não foi possível criar o tenant SISMOB.');
        }

        const [unidade] = await tx
          .insert(unidadesTable)
          .values({
            tenant_id: tenantId,
            nome: 'MATRIZ - CENTRAL',
            cnpj: cliente.cnpj,
            is_matriz: true,
          })
          .returning();

        if (!unidade) {
          throw new Error('Não foi possível criar a unidade matriz.');
        }

        const [owner] = await tx
          .insert(pessoasTable)
          .values({
            tenant_id: tenantId,
            unidade_id: unidade.id,
            endereco_id: null,

            auth_user_id: authUserId,
            deve_trocar_senha: true,

            tipo: 'f',
            papel: '6',
            nome: cliente.nome,
            email: cliente.email,

            // Temporariamente utilizamos o CNPJ,
            // pois o cadastro Flaience ainda não possui CPF do responsável.
            documento: cliente.cnpj,

            telefone: cliente.whatsapp || cliente.fone || null,

            is_admin: true,
            cargo: 'owner',

            onboarding_status: {
              status: 'pendente',
              primeiro_acesso: false,
            },
          })
          .returning();

        if (!owner) {
          throw new Error('Não foi possível criar o Owner do tenant.');
        }
      });

      // ========================================
      // 3. FINALIZA NA BASE FLAIENCE
      // ========================================

      await this.atualizarProduto(clienteProdutoId, {
        tenant_id: tenantId,
        auth_user_id: authUserId,
        provisionamento_status: 'concluido',
        provisionado_em: new Date().toISOString(),
        data_ativacao: new Date().toISOString(),
        ultimo_erro: null,
      });

      return {
        success: true,
        clienteProdutoId,
        clienteId: cliente.id,
        tenantId,
        authUserId,
        login: cliente.email,

        // Deve ser exibida ou enviada apenas nesta operação.
        senhaTemporaria,
      };
    } catch (error: any) {
      console.error('❌ [PROVISIONAMENTO SISMOB]', error);

      if (authUserId) {
        await this.sismobAdmin.auth.admin
          .deleteUser(authUserId)
          .catch(() => undefined);
      }

      if (tenantId) {
        const tenantsTable = schema.tenants as any;

        await this.db
          .delete(tenantsTable)
          .where(eq(tenantsTable.id, tenantId))
          .catch(() => undefined);
      }

      await this.atualizarProduto(clienteProdutoId, {
        provisionamento_status: 'erro',
        ultimo_erro:
          error?.message || 'Erro não identificado durante o provisionamento.',
      }).catch(() => undefined);

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Falha no provisionamento do SISMOB: ${error.message}`,
      );
    }
  }

  private async buscarProduto(
    clienteProdutoId: string,
  ): Promise<ProdutoFlaience> {
    const { data, error } = await this.flaienceAdmin
      .from('flaience_cliente_produtos')
      .select('*')
      .eq('id', clienteProdutoId)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        error?.message || 'Produto contratado não encontrado na base Flaience.',
      );
    }

    return data as ProdutoFlaience;
  }

  private async buscarCliente(clienteId: string): Promise<ClienteFlaience> {
    const { data, error } = await this.flaienceAdmin
      .from('flaience_clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        error?.message || 'Cliente não encontrado na base Flaience.',
      );
    }

    return data as ClienteFlaience;
  }

  private validarProduto(produto: ProdutoFlaience) {
    if (produto.produto !== 'sismob') {
      throw new ConflictException(
        'O produto informado não pertence ao SISMOB.',
      );
    }

    if (produto.situacao !== 'ativo') {
      throw new ConflictException(
        'O produto precisa estar ativo para ser provisionado.',
      );
    }

    if (produto.provisionamento_status === 'processando') {
      throw new ConflictException('Este produto já está sendo provisionado.');
    }

    if (
      produto.provisionamento_status === 'concluido' ||
      produto.tenant_id ||
      produto.auth_user_id
    ) {
      throw new ConflictException('Este produto já foi provisionado.');
    }

    if (
      produto.provisionamento_status !== 'pendente' &&
      produto.provisionamento_status !== 'erro'
    ) {
      throw new ConflictException('Status de provisionamento inválido.');
    }
  }

  private async atualizarProduto(
    clienteProdutoId: string,
    payload: Record<string, unknown>,
  ) {
    const { error } = await this.flaienceAdmin
      .from('flaience_cliente_produtos')
      .update(payload)
      .eq('id', clienteProdutoId);

    if (error) {
      throw new Error(
        `Não foi possível atualizar o produto na base Flaience: ${error.message}`,
      );
    }
  }

  private async gerarSlugUnico(nomeFantasia: string): Promise<string> {
    const baseSlug =
      nomeFantasia
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'imobiliaria';

    const tenantsTable = schema.tenants as any;

    let slug = baseSlug;
    let tentativa = 1;

    while (true) {
      const existente = await this.db
        .select({ id: tenantsTable.id })
        .from(tenantsTable)
        .where(eq(tenantsTable.slug, slug))
        .limit(1);

      if (existente.length === 0) {
        return slug;
      }

      tentativa += 1;
      slug = `${baseSlug}-${tentativa}`;
    }
  }
}
