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

  // 1. ROTA PÚBLICA: Identifica a imobiliária pelo domínio (Usada no TenantContext)
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
  @Get()
  async findAll(@Query('papel') papel: string, @Request() req: any) {
    // req.user vem da nossa SupabaseStrategy
    const imobiliariaId = req.user.imobiliariaId;
    return this.pessoasService.findByRole(papel, imobiliariaId);
  }

  // 3. ROTA PROTEGIDA: Cria novos usuários/clientes
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(@Body() dto: any, @Request() req: any) {
    const imobiliariaId = req.user.imobiliariaId;
    return this.pessoasService.createUsuario(dto, imobiliariaId);
  }
}
