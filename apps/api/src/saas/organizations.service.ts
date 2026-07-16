import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type OrganizationInput = {
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  fone?: string | null;
  whatsapp?: string | null;
  observacoes?: string | null;
};

@Injectable()
export class OrganizationsService {
  private readonly flaienceAdmin: SupabaseClient;

  constructor() {
    const flaienceUrl = process.env.FLAIENCE_SUPABASE_URL;
    const flaienceServiceRoleKey =
      process.env.FLAIENCE_SUPABASE_SERVICE_ROLE_KEY;

    if (!flaienceUrl) {
      throw new Error('FLAIENCE_SUPABASE_URL não configurada na API.');
    }

    if (!flaienceServiceRoleKey) {
      throw new Error(
        'FLAIENCE_SUPABASE_SERVICE_ROLE_KEY não configurada na API.',
      );
    }

    this.flaienceAdmin = createClient(flaienceUrl, flaienceServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async findAll(search?: string) {
    try {
      let query = this.flaienceAdmin
        .from('flaience_clientes')
        .select(
          `
          id,
          nome,
          nome_fantasia,
          cnpj,
          email,
          fone,
          whatsapp,
          observacoes,
          created_at,
          updated_at
        `,
        )
        .order('created_at', {
          ascending: false,
        });

      const normalizedSearch = search?.trim();

      if (normalizedSearch) {
        const safeSearch = normalizedSearch.replace(/[%_,()]/g, ' ').trim();

        query = query.or(
          [
            `nome.ilike.%${safeSearch}%`,
            `nome_fantasia.ilike.%${safeSearch}%`,
            `cnpj.ilike.%${safeSearch}%`,
            `email.ilike.%${safeSearch}%`,
          ].join(','),
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    } catch (error: any) {
      console.error('❌ [FLAIENCE] Erro ao listar organizações:', error);

      throw new InternalServerErrorException(
        `Erro ao listar organizações: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID da organização não informado.');
      }

      const { data, error } = await this.flaienceAdmin
        .from('flaience_clientes')
        .select(
          `
          id,
          nome,
          nome_fantasia,
          cnpj,
          email,
          fone,
          whatsapp,
          observacoes,
          created_at,
          updated_at
        `,
        )
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new NotFoundException('Organização não encontrada.');
      }

      return data;
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('❌ [FLAIENCE] Erro ao buscar organização:', error);

      throw new InternalServerErrorException(
        `Erro ao buscar organização: ${error.message}`,
      );
    }
  }

  async create(dto: OrganizationInput) {
    try {
      const payload = this.buildPayload(dto);

      await this.assertCnpjAvailable(payload.cnpj);

      const { data, error } = await this.flaienceAdmin
        .from('flaience_clientes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new ConflictException(
            'Já existe uma organização cadastrada com este CNPJ.',
          );
        }

        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('❌ [FLAIENCE] Erro ao criar organização:', error);

      throw new InternalServerErrorException(
        `Erro ao criar organização: ${error.message}`,
      );
    }
  }

  async update(id: string, dto: Partial<OrganizationInput>) {
    try {
      if (!id) {
        throw new BadRequestException('ID da organização não informado.');
      }

      const current = await this.findOne(id);

      const payload = this.buildPayload({
        nome: dto.nome ?? current.nome,
        nome_fantasia: dto.nome_fantasia ?? current.nome_fantasia,
        cnpj: dto.cnpj ?? current.cnpj,
        email: dto.email ?? current.email,
        fone: dto.fone !== undefined ? dto.fone : current.fone,
        whatsapp: dto.whatsapp !== undefined ? dto.whatsapp : current.whatsapp,
        observacoes:
          dto.observacoes !== undefined ? dto.observacoes : current.observacoes,
      });

      if (payload.cnpj !== current.cnpj) {
        await this.assertCnpjAvailable(payload.cnpj, id);
      }

      const { data, error } = await this.flaienceAdmin
        .from('flaience_clientes')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505') {
          throw new ConflictException(
            'Já existe uma organização cadastrada com este CNPJ.',
          );
        }

        throw new Error(error.message);
      }

      if (!data) {
        throw new NotFoundException('Organização não encontrada.');
      }

      return data;
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('❌ [FLAIENCE] Erro ao atualizar organização:', error);

      throw new InternalServerErrorException(
        `Erro ao atualizar organização: ${error.message}`,
      );
    }
  }

  private buildPayload(dto: OrganizationInput): OrganizationInput {
    const nome = dto.nome?.trim();
    const nomeFantasia = dto.nome_fantasia?.trim();
    const cnpj = dto.cnpj?.trim();
    const email = dto.email?.trim().toLowerCase();

    if (!nome) {
      throw new BadRequestException('O nome do responsável é obrigatório.');
    }

    if (!nomeFantasia) {
      throw new BadRequestException('O nome fantasia é obrigatório.');
    }

    if (!cnpj) {
      throw new BadRequestException('O CNPJ é obrigatório.');
    }

    if (!email) {
      throw new BadRequestException('O e-mail é obrigatório.');
    }

    return {
      nome,
      nome_fantasia: nomeFantasia,
      cnpj,
      email,
      fone: dto.fone?.trim() || null,
      whatsapp: dto.whatsapp?.trim() || null,
      observacoes: dto.observacoes?.trim() || null,
    };
  }

  private async assertCnpjAvailable(cnpj: string, ignoredId?: string) {
    let query = this.flaienceAdmin
      .from('flaience_clientes')
      .select('id')
      .eq('cnpj', cnpj);

    if (ignoredId) {
      query = query.neq('id', ignoredId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      throw new Error(`Erro ao validar CNPJ: ${error.message}`);
    }

    if (data && data.length > 0) {
      throw new ConflictException(
        'Já existe uma organização cadastrada com este CNPJ.',
      );
    }
  }
}
