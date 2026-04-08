import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.warn('⚠️ Alerta: Chaves do Supabase Storage não configuradas.');
    } else {
      this.supabase = createClient(url, key);
    }
  }

  async uploadFoto(file: any, path: string): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Serviço de Storage não configurado.');
    }

    // Criar um nome único para o arquivo
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    const filePath = `${path}/${fileName}`;

    // Upload para o Bucket 'sismob-media' que criamos no Supabase
    const { data, error } = await this.supabase.storage
      .from('sismob-media')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('❌ Erro Supabase Storage:', error.message);
      throw new BadRequestException(`Falha no upload: ${error.message}`);
    }

    // Retorna a URL pública
    const { data: publicUrl } = this.supabase.storage
      .from('sismob-media')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }
}
