import { Controller, Post, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files') // Prefixo: /files
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload') // Rota final: /files/upload
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: any[]) {
    // Retorna o array de URLs das fotos enviadas
    return await this.filesService.uploadMultiple(files);
  }

  
}