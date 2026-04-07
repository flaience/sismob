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
    // Agora o .createUsuario existe no Service!
    return this.pessoasService.createUsuario(dto, req.user.imobiliariaId);
  }

  // Rota de identificação pública (SEM LOGIN)
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    return this.pessoasService.findImobiliariaByHost(host);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Query('papel') papel: string, @Request() req: any) {
    return this.pessoasService.findByRole(papel, req.user.imobiliariaId);
  }
}
