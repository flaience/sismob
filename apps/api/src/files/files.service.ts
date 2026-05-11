import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFileName } from '../common/utils/file-utils';

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  /**
   * UPLOAD DE ARQUIVO ÚNICO (Logo da Empresa, Perfil)
   */
  async uploadSingle(file: any, path: string = 'geral'): Promise<string> {
    const nomeLimpo = sanitizeFileName(file.originalname);
    const filePath = `${path}/${Date.now()}-${nomeLimpo}`;

    const { error } = await this.supabase.storage
      .from('sismob-media')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error)
      throw new BadRequestException(`Erro no Storage: ${error.message}`);

    const { data } = this.supabase.storage
      .from('sismob-media')
      .getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * UPLOAD MÚLTIPLO (Galeria de Imóveis)
   * Resolve o erro de reconhecimento no Controller
   */
  async uploadMultiple(files: any[], path: string = 'imoveis'): Promise<any[]> {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      const nomeLimpo = sanitizeFileName(file.originalname);
      const filePath = `${path}/${Date.now()}-${nomeLimpo}`;

      const { error } = await this.supabase.storage
        .from('sismob-media')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw new Error(error.message);

      const { data } = this.supabase.storage
        .from('sismob-media')
        .getPublicUrl(filePath);

      // RETORNA UM OBJETO RICO (O segredo para o banco de mídias)
      return {
        url: data.publicUrl,
        tipo: 'foto_interna', // Padrão inicial
        is_capa: false,
      };
    });

    return await Promise.all(uploadPromises);
  }
}
