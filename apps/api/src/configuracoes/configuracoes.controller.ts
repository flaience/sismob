import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { GenericConfigService } from './generic-config.service';

@Controller('configuracoes')
export class ConfiguracoesController {
  private readonly logger = new Logger('ConfigFactory');

  constructor(private readonly configService: GenericConfigService) {}

  private getTableName(slug: string): string {
    // MAPEAMENTO FORÇADO (O segredo para matar o erro 500)
    const map: any = {
      bancos: 'bancos',
      unidades: 'unidades',
      'grupos-caixa': 'grupoCaixa',

      // Quando a URL for /configuracoes/atributos -> Grava na tabela 'atributos'
      atributos: 'atributos',

      // Quando a URL for /configuracoes/categorias-atributos -> Grava na tabela 'categoriasAtributos'
      'categorias-atributos': 'categoriasAtributos',
    };

    const table = map[slug];
    if (!table) {
      console.error(
        `❌ [SISMOB] Rota ${slug} não mapeada para nenhuma tabela!`,
      );
    }
    return table || slug;
  }

  @Get(':slug')
  async list(@Param('slug') slug: string, @Query('imobiliariaId') tid: string) {
    let tableTarget = slug === 'atributos' ? 'atributos' : slug;
    if (slug === 'grupos-caixa') tableTarget = 'grupoCaixa';

    return this.configService.findAll(tableTarget, tid);
  }

  @Post(':slug')
  async save(@Param('slug') slug: string, @Body() dto: any) {
    // MAPEAMENTO FORÇADO POR HARDCODE
    let tableTarget = '';

    if (slug === 'atributos') tableTarget = 'atributos';
    else if (slug === 'unidades') tableTarget = 'unidades';
    else if (slug === 'bancos') tableTarget = 'bancos';
    else if (slug === 'grupos-caixa') tableTarget = 'grupoCaixa';
    else tableTarget = slug;

    this.logger.log(`🏗️ Rota: ${slug} -> Gravando na Tabela: ${tableTarget}`);

    return this.configService.upsert(tableTarget, dto, dto.imobiliariaId);
  }

  @Delete(':slug/:id')
  async remove(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Query('imobiliariaId') tid: string,
  ) {
    return this.configService.remove(this.getTableName(slug), +id, tid);
  }
}
