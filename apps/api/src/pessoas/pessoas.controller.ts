import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PessoasService } from './pessoas.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pessoas')
export class PessoasController {
  constructor(
    // Forçamos o NestJS a injetar o serviço pelo Token da Classe
    @Inject(PessoasService)
    private readonly pessoasService: PessoasService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(@Body() dto: any, @Request() req: any) {
    // Agora o .createUsuario existe no Service!
    return this.pessoasService.createUsuario(dto, req.user.imobiliariaId);
  }

  // Rota de identificação pública (SEM LOGIN)
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    // Adicionamos uma proteção extra para depuração
    if (!this.pessoasService) {
      throw new Error(
        'O NestJS falhou em injetar o PessoasService automaticamente.',
      );
    }

    return this.pessoasService.findImobiliariaByHost(host);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query('papel') papel: string, @Request() req: any) {
    return this.pessoasService.findByRole(papel, req.user.imobiliariaId);
  }
}
