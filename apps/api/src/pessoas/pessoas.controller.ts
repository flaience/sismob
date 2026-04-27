import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  NotFoundException,
  Delete,
  Patch,
  Param,
  Inject,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';

@Controller('pessoas')
export class PessoasController {
  constructor(
    @Inject(PessoasService)
    private readonly pessoasService: PessoasService,
  ) {}

  @Get('teste-vivo')
  teste() {
    return { mensagem: 'O módulo de pessoas está carregado!' };
  }
  // 1. IDENTIFICAÇÃO (Sempre pública para o TenantContext)
  @Get('config/identificar')
  async identificar(@Query('host') host: string) {
    console.log(`🔍 Identificando Host: ${host}`);

    const imob = await this.pessoasService.findImobiliariaByHost(host);

    if (!imob) {
      console.error(`❌ Host não encontrado no banco: ${host}`);
      throw new NotFoundException(
        'Imobiliária ou Admin não identificado para este domínio.',
      );
    }

    return imob;
  }

  // 2. LISTAGEM DO GRID (Mata o erro 500)
  @Get()
  async findAll(
    @Query('papel') papel: string,
    @Query('imobiliariaId') imobId: string,
    @Query('search') search: string,
  ) {
    return this.pessoasService.findByRole(papel, imobId, search);
  }

  // 3. BUSCA UM ÚNICO (Para carregar o formulário preenchido)

  // 4. MOTOR DE GRAVAÇÃO UNIFICADO (POST E PATCH chamam o 'save')
  @Post()
  async create(@Body() dto: any) {
    // Pegamos o ID da imobiliária que o site envia no formulário
    return this.pessoasService.save(dto, dto.imobiliariaId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.findOne(id, imobId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    // Garantimos que o ID da URL vá para o método save
    return this.pessoasService.save({ ...dto, id }, dto.imobiliariaId);
  }

  // 5. REMOÇÃO
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('imobiliariaId') imobId: string,
  ) {
    return this.pessoasService.remove(id, imobId);
  }
}
