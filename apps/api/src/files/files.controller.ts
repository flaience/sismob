import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files') // <--- GARANTA QUE O PREFIXO É 'files'
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly filesService: FilesService) {}

  @Post('upload') // <--- ROTA FINAL: /files/upload
  @UseInterceptors(FilesInterceptor('files')) // O frontend envia no campo 'files'
  async upload(@UploadedFiles() files: any[]) {
    this.logger.log(`📸 Recebendo ${files?.length || 0} arquivos para upload.`);

    if (!files || files.length === 0) {
      return [];
    }

    // Retorna as URLs do Supabase Storage
    return await this.filesService.uploadMultiple(files, 'imoveis');
  }
}
