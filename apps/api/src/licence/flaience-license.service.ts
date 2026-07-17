import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type FlaienceLicenseState =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'error'
  | 'not_found';

export type FlaienceLicenseResult = {
  allowed: boolean;
  state: FlaienceLicenseState;

  tenantId: string;
  product: 'sismob';

  situation?: string;
  provisioningStatus?: string;

  message: string;
};

@Injectable()
export class FlaienceLicenseService {
  private readonly flaienceAdmin: SupabaseClient;

  constructor() {
    const flaienceUrl = process.env.FLAIENCE_SUPABASE_URL;

    const flaienceServiceRoleKey =
      process.env.FLAIENCE_SUPABASE_SERVICE_ROLE_KEY;

    if (!flaienceUrl) {
      throw new Error(
        'FLAIENCE_SUPABASE_URL não configurada na API do SISMOB.',
      );
    }

    if (!flaienceServiceRoleKey) {
      throw new Error(
        'FLAIENCE_SUPABASE_SERVICE_ROLE_KEY não configurada na API do SISMOB.',
      );
    }

    this.flaienceAdmin = createClient(flaienceUrl, flaienceServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async validateSismobTenant(tenantId: string): Promise<FlaienceLicenseResult> {
    if (!tenantId) {
      return {
        allowed: false,
        state: 'not_found',
        tenantId: '',
        product: 'sismob',
        message: 'Tenant não identificado.',
      };
    }

    try {
      const { data, error } = await this.flaienceAdmin
        .from('flaience_cliente_produtos')
        .select(
          `
            id,
            cliente_id,
            produto,
            situacao,
            provisionamento_status,
            tenant_id,
            auth_user_id,
            provisionado_em,
            ultimo_erro
          `,
        )
        .eq('produto', 'sismob')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('❌ [FLAIENCE LICENSE] Erro Supabase:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        throw new Error(
          [
            error.message,
            error.code ? `Código: ${error.code}` : null,
            error.details ? `Detalhes: ${error.details}` : null,
            error.hint ? `Dica: ${error.hint}` : null,
          ]
            .filter(Boolean)
            .join(' | '),
        );
      }

      if (!data) {
        return {
          allowed: false,
          state: 'not_found',
          tenantId,
          product: 'sismob',
          message: 'Nenhuma licença SISMOB foi encontrada para este tenant.',
        };
      }

      const situation = String(data.situacao ?? '').toLowerCase();

      const provisioningStatus = String(
        data.provisionamento_status ?? '',
      ).toLowerCase();

      if (situation !== 'ativo') {
        return {
          allowed: false,
          state: 'inactive',
          tenantId,
          product: 'sismob',
          situation,
          provisioningStatus,
          message: 'O produto SISMOB está inativo para esta organização.',
        };
      }

      if (
        provisioningStatus === 'pendente' ||
        provisioningStatus === 'processando'
      ) {
        return {
          allowed: false,
          state: 'pending',
          tenantId,
          product: 'sismob',
          situation,
          provisioningStatus,
          message: 'O acesso ao SISMOB ainda está sendo preparado.',
        };
      }

      if (provisioningStatus === 'erro') {
        return {
          allowed: false,
          state: 'error',
          tenantId,
          product: 'sismob',
          situation,
          provisioningStatus,
          message:
            data.ultimo_erro ||
            'O provisionamento do SISMOB possui uma falha pendente.',
        };
      }

      if (provisioningStatus !== 'concluido') {
        return {
          allowed: false,
          state: 'pending',
          tenantId,
          product: 'sismob',
          situation,
          provisioningStatus,
          message: 'O produto ainda não está liberado para operação.',
        };
      }

      return {
        allowed: true,
        state: 'active',
        tenantId,
        product: 'sismob',
        situation,
        provisioningStatus,
        message: 'Licença SISMOB ativa.',
      };
    } catch (error: any) {
      console.error('❌ [FLAIENCE LICENSE] Falha ao consultar licença:', error);

      throw new InternalServerErrorException({
        message: 'Não foi possível validar a licença Flaience.',
        technicalMessage: error?.message || 'Erro desconhecido.',
      });
    }
  }
}
