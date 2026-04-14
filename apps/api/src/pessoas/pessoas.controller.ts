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

  // ROTA PÚBLICA DE IDENTIFICAÇÃO
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    const imob = await this.pessoasService.findImobiliariaByHost(host);
    if (!imob) throw new NotFoundException('Imobiliária não identificada.');
    return imob;
  }

  // LISTAGEM ABERTA (Mata o erro 401)
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobiliariaId: string,
    @Query('search') search: string,
  ) {
    return this.pessoasService.findByRole(papel, imobiliariaId, search);
  }

  // BUSCA INDIVIDUAL ABERTA
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.findOne(id, imobId);
  }

  // CRIAÇÃO ABERTA (Mata o erro 401 no botão Salvar)
  @Post()
  async create(@Body() dto: any) {
    // Pegamos o imobiliariaId que o site envia no formulário
    return this.pessoasService.createUsuario(dto, dto.imobiliariaId);
  }

  // ALTERAÇÃO ABERTA
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.pessoasService.updateCompleto(id, dto, dto.imobiliariaId);
  }

  // DELEÇÃO ABERTA
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.remove(id, imobId);
  }
}
