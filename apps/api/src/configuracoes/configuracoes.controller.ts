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
    // MAPEAMENTO RADICAL: Sem chance de erro humano
    if (slug === 'atributos') return 'atributos';
    if (slug === 'categorias-atributos') return 'categoriasAtributos';
    if (slug === 'unidades') return 'unidades';
    if (slug === 'bancos') return 'bancos';
    if (slug === 'grupos-caixa') return 'grupoCaixa';
    return slug;
  }

  @Get(':slug')
  async list(@Param('slug') slug: string, @Query('imobiliariaId') tid: string) {
    // 1. Traduz a URL com traço para o nome da variável no Schema.ts
    const mappedTable = this.getTableName(slug);

    // 2. Chama o service com o nome CORRETO (ex: categoriasAtributos)
    return this.configService.findAll(mappedTable, tid);
  }
  @Post(':slug')
  async save(@Param('slug') slug: string, @Body() dto: any) {
    const tableMapped = this.getTableName(slug);

    // O SEGREDO: Pegamos o ID que o Frontend envia no campo 'imobiliariaId'
    const tenantId = dto.imobiliariaId;

    if (!tenantId) {
      this.logger.error(
        `❌ O campo imobiliariaId não veio no Body para a rota ${slug}`,
      );
      throw new InternalServerErrorException(
        'ID da imobiliária ausente na requisição.',
      );
    }

    return this.configService.upsert(tableMapped, dto, tenantId);
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
