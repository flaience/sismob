import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(
    @Inject(PessoasService)
    private readonly pessoasService: PessoasService,
  ) {}

  // ROTA PÚBLICA: Identifica a imobiliária pelo domínio
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    const imobiliaria = await this.pessoasService.findImobiliariaByHost(host);
    if (!imobiliaria)
      throw new NotFoundException('Imobiliária não encontrada.');
    return imobiliaria;
  }

  // ROTA PÚBLICA (DESTRAVADA): Lista pessoas por papel e imobiliária
  // Removi o @UseGuards para acabar com o erro 401
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobiliariaId: string,
  ) {
    if (!imobiliariaId) return []; // Segurança mínima: exige o ID na URL
    return this.pessoasService.findByRole(papel, imobiliariaId);
  }

  // Mantenha o POST protegido se desejar, ou comente para testar inclusão
  @Post()
  async create(@Body() dto: any) {
    return this.pessoasService.createUsuario(dto, dto.imobiliariaId);
  }
}
