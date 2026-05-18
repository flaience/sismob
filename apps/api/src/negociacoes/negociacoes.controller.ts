import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { NegociacoesService } from './negociacoes.service';

@Controller('negociacoes')
export class NegociacoesController {
  constructor(private readonly negociacoesService: NegociacoesService) {}

  @Get()
  async list(@Query('imobiliariaId') tid: string) {
    return this.negociacoesService.findAll(tid);
  }

  @Get(':id')
  async one(@Param('id') id: string, @Query('imobiliariaId') tid: string) {
    return this.negociacoesService.findOne(Number(id), tid);
  }

  @Post()
  async save(@Body() dto: any) {
    return this.negociacoesService.upsert(dto, dto.imobiliariaId);
  }

  @Post(':id/finalizar')
  async finish(@Param('id') id: string, @Body('imobiliariaId') tid: string, @Req() req: any) {
    return this.negociacoesService.finalizar(Number(id), tid, req.user?.id);
  }
}