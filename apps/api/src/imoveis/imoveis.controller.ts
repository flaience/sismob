import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFiles,
  Request,
  Delete,
  Inject,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ImoveisService } from './imoveis.service';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    @Inject(ImoveisService) private readonly imoveisService: ImoveisService,
  ) {}

  @Get()
  async findAll(@Query('imobiliariaId') tenantId: string) {
    return this.imoveisService.findAll(tenantId);
  }

  @Get('portal/search') // Rota: /imoveis/portal/search
  async search(@Query('imobiliariaId') tid: string, @Query() query: any) {
    // Converte a string de atributos (ex: "1,2,3") em um array de números
    if (query.atributos && typeof query.atributos === 'string') {
      query.atributos = query.atributos.split(',').map(Number);
    }
    return this.imoveisService.buscarPortal(tid, query);
  }
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') tenantId: string,
  ) {
    return this.imoveisService.findOne(+id, tenantId);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'galeria', maxCount: 20 },
      { name: 'foto360', maxCount: 10 },
    ]),
  )
  async save(@Body() data: any, @UploadedFiles() files: any) {
    // Pegamos o tenantId (imobiliária) enviado pelo form
    return this.imoveisService.upsert(data, files, data.imobiliariaId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Query('imobiliariaId') tid: string) {
    // Para pessoas: id é UUID (string). Para imoveis: id é SERIAL (Number).
    const parsedId = isNaN(Number(id)) ? id : Number(id);
    return this.imoveisService.remove(parsedId as any, tid);
  }
}
