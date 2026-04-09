import { RolesGuard } from './../auth/roles.guard';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';
import { AuthGuard } from '@nestjs/passport';
import { Delete } from '@nestjs/common'; // Adicione Delete no import

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
    // Unificamos os arquivos para o service processar
    const allFiles = [...(files.galeria || []), ...(files.foto360 || [])];

    // Pegamos o imobiliariaId que o front envia para garantir o multi-tenant
    return this.imoveisService.upsertImovel(data, allFiles, data.imobiliariaId);
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // <--- ESTE GUARDA É O QUE REALMENTE PROTEGE O BANCO
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.imoveisService.remove(+id, req.user.imobiliariaId);
  }
}
