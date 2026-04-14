import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  NotFoundException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { AuthGuard } from '@nestjs/passport';

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
  @UseGuards(AuthGuard('jwt')) // <--- REATIVADO: Só corretores veem a lista de clientes/proprietários
  async findAll(@Query('papel') papel: string, @Request() req: any) {
    return this.pessoasService.findByRole(papel, req.user.imobiliariaId);
  }

  // Mantenha o POST protegido se desejar, ou comente para testar inclusão
  @Post()
  async create(@Body() dto: any) {
    return this.pessoasService.createUsuario(dto, dto.imobiliariaId);
  }
}
