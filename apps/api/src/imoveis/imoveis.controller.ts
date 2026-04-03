// apps/api/src/imoveis/imoveis.controller.ts

import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { ImoveisService } from './imoveis.service';
import { CreateImovelDto } from './dto/create-imovel.dto';

@Controller('imoveis')
// O NestJS usa o nome do controller para criar a rota. Então, 'imoveis' aqui significa que as rotas serão '/imoveis'
export class ImoveisController {
  // A palavra 'private' é OBRIGATÓRIA aqui para o NestJS funcionar
  constructor(
    @Inject(ImoveisService)
    private readonly imoveisService: ImoveisService,
  ) {}

  @Post()
  async create(@Body() createImovelDto: CreateImovelDto) {
    // Verificamos se o serviço existe antes de chamar
    if (!this.imoveisService) {
      console.error('❌ ERRO: ImoveisService não foi injetado no Controller!');
    }
    return this.imoveisService.create(createImovelDto);
  }

  @Get()
  async findAll() {
    return this.imoveisService.findAll();
  }
}
