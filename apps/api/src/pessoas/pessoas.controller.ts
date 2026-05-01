import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  // 1. ROTA ESTÁTICA PRIMEIRO (Evita 404)
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    console.log(`🔍 [SISMOB] Identificando Host: ${host}`);
    const imob = await this.pessoasService.findImobiliariaByHost(host);

    if (!imob) {
      // Em vez de dar erro 404, retornamos um objeto vazio para não travar o frontend
      return { id: null, nome_conta: 'Imobiliária não cadastrada' };
    }
    return imob;
  }

  // Busca por ID
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') tid: string, // Pegamos o ID da imobiliária da URL
  ) {
    // Agora o Service e o Controller falam a mesma língua
    return this.pessoasService.findOne(id, tid);
  }
  // ESTA É A ROTA DE DIAGNÓSTICO:
  @Get('teste-vivo')
  teste() {
    return {
      status: 'SISMOB ONLINE',
      timestamp: new Date().toISOString(),
      mensagem: 'Se você lê isso, o Railway está funcionando perfeitamente!',
    };
  }
  // Rota de Identificação

  // Listagem do Grid
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobId: string,
    @Query('search') search: string,
  ) {
    return this.pessoasService.findByRole(papel, imobId, search);
  }

  // Salvar (POST e PATCH chamam o save com 2 argumentos)
  @Post()
  async create(@Body() dto: any) {
    return this.pessoasService.save(dto, dto.imobiliariaId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.pessoasService.save({ ...dto, id }, dto.imobiliariaId);
  }

  // Remover
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.remove(id, imobId);
  }
}
