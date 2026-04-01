import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PessoasService } from './pessoas.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(@Body() dto: any, @Request() req: any) {
    // Vincula automaticamente à imobiliária do usuário logado
    return this.pessoasService.createUsuario(dto, req.user.imobiliariaId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query('papel') papel: string, @Request() req: any) {
    // Filtra por papel (1-6) e garante que só veja os dados da sua imobiliária
    return this.pessoasService.findByRole(papel as any, req.user.imobiliariaId);
  }
}
