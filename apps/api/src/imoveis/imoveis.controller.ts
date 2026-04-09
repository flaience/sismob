import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  Inject, // <--- Importe o Inject
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    // USAMOS O @Inject AQUI PARA FORÇAR A ENTRADA DO SERVIÇO
    @Inject(ImoveisService)
    private readonly imoveisService: ImoveisService,
  ) {}

  @Get()
  async findAll(@Query('imobiliariaId') imobiliariaId: string) {
    if (!this.imoveisService) {
      throw new Error('Erro de Injeção: ImoveisService está undefined');
    }
    return this.imoveisService.findAll(imobiliariaId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('imagens'))
  async create(@Body() data: any, @UploadedFiles() files: any[]) {
    if (!this.imoveisService) {
      throw new Error('Erro de Injeção: ImoveisService está undefined');
    }
    return this.imoveisService.createWithImages(
      data,
      files,
      data.imobiliariaId,
    );
  }
}
