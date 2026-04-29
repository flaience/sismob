import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  // Rota de Identificação
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    return this.pessoasService.findImobiliariaByHost(host);
  }

  // Listagem do Grid
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobId: string,
    @Query('search') search: string,
  ) {
    return this.pessoasService.findByRole(papel, imobId, search);
  }

  // Busca por ID
  @Get(':id')
  async findOne(@Param('id') id: string, @Query('imobiliariaId') tid: string) {
    return this.pessoasService.findOne(id, tid);
  }

  // Salvar (POST e PATCH chamam o save com 2 argumentos)
  @Post()
  async create(@Body() dto: any) {
    return this.pessoasService.save(dto, dto.imobiliariaId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.pessoasService.save({ ...dto, id }, dto.imobiliariaId);
  }

  // Remover
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.remove(id, imobId);
  }
}
