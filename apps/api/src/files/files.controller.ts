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
  @Get('check')
  ping() {
    return { status: 'Motor de Mídia Online' };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: any[]) {
    return await this.filesService.uploadMultiple(files, 'imoveis');
  }
}
