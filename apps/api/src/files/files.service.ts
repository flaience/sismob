import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable() // <--- CERTIFIQUE-SE DE QUE ESTA LINHA EXISTE!
export class FilesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async uploadFoto(file: any, path: string): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('sismob-media')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new BadRequestException(error.message);

    const { data: publicUrl } = this.supabase.storage
      .from('sismob-media')
      .getPublicUrl(filePath);
    return publicUrl.publicUrl;
  }
}
