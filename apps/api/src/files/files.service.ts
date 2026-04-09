/// <reference types="multer" />
import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFileName } from '../comon/utils/file-utils'; // <--- IMPORTANDO O UTILITÁRIO

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async uploadFoto(file: any, path: string): Promise<string> {
    if (!this.supabase)
      throw new BadRequestException('Storage não configurado.');

    // USANDO A NOSSA UNIT DE UTILITÁRIO
    const cleanName = sanitizeFileName(file.originalname);
    const fileName = `${Date.now()}-${cleanName}`;
    const filePath = `${path}/${fileName}`;

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

    const { data: publicUrl } = this.supabase.storage
      .from('sismob-media')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }
}
