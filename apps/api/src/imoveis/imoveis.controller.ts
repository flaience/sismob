import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';

@Controller('imoveis')
export class ImoveisController {
  constructor(private readonly imoveisService: ImoveisService) {}

  @Get()
  async findAll(@Query('imobiliariaId') imobiliariaId: string) {
    return this.imoveisService.findAll(imobiliariaId);
  }

  // SEM NENHUM DECORATOR DE SEGURANÇA
  @Post()
  @UseInterceptors(FilesInterceptor('imagens'))
  async create(@Body() data: any, @UploadedFiles() files: any[]) {
    console.log('📥 Recebendo cadastro de imóvel via POST aberto');
    // Pegamos o imobiliariaId que o front vai mandar no formulário
    return this.imoveisService.createWithImages(
      data,
      files,
      data.imobiliariaId,
    );
  }
}
