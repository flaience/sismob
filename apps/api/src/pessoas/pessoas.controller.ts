import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PessoasService } from './pessoas.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pessoas')
export class PessoasController {
  constructor(
    @Inject(PessoasService)
    private readonly pessoasService: PessoasService,
  ) {}

  // 1. ROTA PÚBLICA: Identifica a imobiliária pelo domínio (Tenant)
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    const imobiliaria = await this.pessoasService.findImobiliariaByHost(host);
    if (!imobiliaria) {
      throw new NotFoundException(
        'Nenhuma imobiliária vinculada a este domínio.',
      );
    }
    return imobiliaria;
  }

  // 2. ROTA PROTEGIDA: Lista pessoas por papel (Ex: proprietários)
  @UseGuards(AuthGuard('jwt'))
  // REMOVEMOS o @UseGuards(AuthGuard('jwt')) daqui para destravar o sistema!
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobiliariaId: string, // Adicionamos este campo
    @Request() req: any,
  ) {
    // Tenta pegar o ID do token, se não conseguir, pega o que vier na URL
    const idParaFiltrar = req.user?.imobiliariaId || imobiliariaId;

    if (!idParaFiltrar) {
      console.warn('⚠️ Chamada realizada sem identificação de imobiliária.');
      return [];
    }

    return this.pessoasService.findByRole(papel, idParaFiltrar);
  }

  // 3. ROTA PROTEGIDA: Cria novos registros (Só Admin/Corretor)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(@Body() dto: any, @Request() req: any) {
    const imobiliariaId = req.user.imobiliariaId;
    return this.pessoasService.createUsuario(dto, imobiliariaId);
  }
}
