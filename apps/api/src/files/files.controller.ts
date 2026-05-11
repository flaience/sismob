import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFiles,
  Body,
  Logger,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files') // <--- GARANTA QUE O PREFIXO É 'files'
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // ADICIONE ESTA ROTA DE TESTE:
  @Get('ping')
  ping() {
    return { status: 'Motor de Mídia Sismob Online' };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: any[]) {
    if (!files || files.length === 0) return [];
    return await this.filesService.uploadMultiple(files, 'imoveis');
  }
}
