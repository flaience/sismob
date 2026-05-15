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
// O SEGREDO: O nome deve ser exatamente ConfiguracoesController e ter o 'export'
export class ConfiguracoesController {
  private readonly logger = new Logger('ConfigFactory');

  constructor(private readonly configService: GenericConfigService) {}

  private getTableName(slug: string): string {
    const map: Record<string, string> = {
      bancos: 'bancos',
      unidades: 'unidades',
      'grupos-caixa': 'grupo_caixa', // Nome real no Postgres
      atributos: 'atributos',
      'atributos-itens': 'atributos',
      'categorias-atributos': 'categorias_atributos', // Nome real no Postgres
    };

    return map[slug] || slug;
  }

  @Get(':slug')
  async list(@Param('slug') slug: string, @Query('imobiliariaId') tid: string) {
    const table = this.getTableName(slug);
    return this.configService.findAll(table, tid);
  }

  @Get(':slug/:id')
  async findOne(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Query('imobiliariaId') tid: string,
  ) {
    const table = this.getTableName(slug);
    return this.configService.findOne(table, Number(id), tid);
  }

  @Post(':slug')
  async save(@Param('slug') slug: string, @Body() dto: any) {
    const table = this.getTableName(slug);
    return this.configService.upsert(table, dto, dto.imobiliariaId);
  }

  @Delete(':slug/:id')
  async remove(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Query('imobiliariaId') tid: string,
  ) {
    const table = this.getTableName(slug);
    return this.configService.remove(table, Number(id), tid);
  }
}
