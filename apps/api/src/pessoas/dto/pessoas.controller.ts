import { Controller, Get, Post, Body } from '@nestjs/common';
import { PessoasService } from './pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  create(@Body() dto: any) {
    return this.pessoasService.create(dto);
  }

  @Get()
  findAll() {
    return this.pessoasService.findAll();
  }
}
