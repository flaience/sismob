/// <reference types="multer" />
import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFileName } from './../common/utils/file-utils'; // Agora o caminho está correto

@Injectable()
export class FilesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async uploadFoto(file: Express.Multer.File, path: string): Promise<string> {
    const nomeLimpo = sanitizeFileName(file.originalname);
    const fileName = `${Date.now()}-${nomeLimpo}`;
    const filePath = `${path}/${fileName}`;

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
}
