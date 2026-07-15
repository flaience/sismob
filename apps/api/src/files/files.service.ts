import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFileName } from '../common/utils/file-utils';

@Injectable()
export class FilesService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseUrl =
      process.env.SISMOB_SUPABASE_URL || process.env.SUPABASE_URL;

    const serviceRoleKey =
      process.env.SISMOB_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      throw new InternalServerErrorException(
        'SISMOB_SUPABASE_URL não configurada para o FilesService.',
      );
    }

    if (!serviceRoleKey) {
      throw new InternalServerErrorException(
        'SISMOB_SUPABASE_SERVICE_ROLE_KEY não configurada para o FilesService.',
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async uploadSingle(file: any, path: string = 'geral'): Promise<string> {
    if (!file?.buffer) {
      throw new BadRequestException('Nenhum arquivo válido foi enviado.');
    }

    const nomeLimpo = sanitizeFileName(file.originalname);
    const filePath = `${path}/${Date.now()}-${nomeLimpo}`;

    const { error } = await this.supabase.storage
      .from('sismob-media')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Erro no Storage: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from('sismob-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async uploadMultiple(files: any[], path: string = 'imoveis'): Promise<any[]> {
    if (!files?.length) return [];

    const uploadPromises = files.map(async (file) => {
      if (!file?.buffer) {
        throw new BadRequestException(
          'Foi encontrado um arquivo inválido na lista.',
        );
      }

      const nomeLimpo = sanitizeFileName(file.originalname);
      const filePath = `${path}/${Date.now()}-${nomeLimpo}`;

      const { error } = await this.supabase.storage
        .from('sismob-media')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new BadRequestException(`Erro no Storage: ${error.message}`);
      }

      const { data } = this.supabase.storage
        .from('sismob-media')
        .getPublicUrl(filePath);

      return {
        url: data.publicUrl,
        tipo: 'foto_interna',
        is_capa: false,
      };
    });

    return Promise.all(uploadPromises);
  }
}
