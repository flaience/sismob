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
