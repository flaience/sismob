import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  NotFoundException,
  UseGuards,
  Delete,
  Patch,
  Param,
  Inject,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';

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

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('search') search: string,
    @Request() req: any,
  ) {
    return this.pessoasService.findByRole(
      papel,
      req.user.imobiliariaId,
      search,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.pessoasService.findOne(id, req.user.imobiliariaId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async create(@Body() dto: any, @Request() req: any) {
    return this.pessoasService.createUsuario(dto, req.user.imobiliariaId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.pessoasService.updateCompleto(id, dto, req.user.imobiliariaId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.pessoasService.remove(id, req.user.imobiliariaId);
  }
}
