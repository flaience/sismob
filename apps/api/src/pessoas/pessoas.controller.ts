import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  NotFoundException,
  Delete,
  Patch,
  Param,
  Inject,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(
    @Inject(PessoasService)
    private readonly pessoasService: PessoasService,
  ) {}

  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    const imob = await this.pessoasService.findImobiliariaByHost(host);
    if (!imob) throw new NotFoundException('Imobiliária não identificada.');
    return imob;
  }

  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobId: string,
    @Query('search') search: string,
  ) {
    return this.pessoasService.findByRole(papel, imobId, search);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.findOne(id, imobId);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.pessoasService.createUsuario(dto, dto.imobiliariaId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    // Agora o Service possui o método updateCompleto!
    return this.pessoasService.updateCompleto(id, dto, dto.imobiliariaId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.remove(id, imobId);
  }
}
