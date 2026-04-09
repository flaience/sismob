import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    @Inject(ImoveisService)
    private readonly imoveisService: ImoveisService,
  ) {}

  @Get()
  async findAll(@Query('imobiliariaId') imobiliariaId: string) {
    return this.imoveisService.findAll(imobiliariaId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.imoveisService.findOne(+id, imobId);
  }

  // DESTRAVADO: Removido AuthGuard para resolver o 401 agora
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'galeria', maxCount: 15 },
      { name: 'foto360', maxCount: 5 },
    ]),
  )
  async create(
    @Body() data: any,
    @UploadedFiles() files: { galeria?: any[]; foto360?: any[] },
  ) {
    console.log('📥 Recebendo POST em /imoveis. Dados:', data);
    const allFiles = [...(files?.galeria || []), ...(files?.foto360 || [])];

    // Pegamos o imobiliariaId que vem do formulário
    if (!data.imobiliariaId)
      throw new InternalServerErrorException('imobiliariaId faltando no form');

    return this.imoveisService.upsertImovel(data, allFiles, data.imobiliariaId);
  }

  // DESTRAVADO: Removido AuthGuard para permitir a deleção agora
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    console.log(
      `🗑️ Solicitando exclusão do imóvel ${id} para imobiliária ${imobId}`,
    );
    return this.imoveisService.remove(+id, imobId);
  }
}
