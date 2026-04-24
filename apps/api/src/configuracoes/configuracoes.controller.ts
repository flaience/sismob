import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { GenericConfigService } from './generic-config.service';

@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configService: GenericConfigService) {}

  // Mapeamento: O que vem na URL -> Nome da tabela no Schema.ts
  private getTableName(slug: string): string {
    const map: any = {
      bancos: 'bancos',
      unidades: 'unidades',
      'grupos-caixa': 'grupoCaixa',
      atributos: 'categoriasAtributos',
    };
    return map[slug];
  }

  @Get(':slug')
  async list(
    @Param('slug') slug: string,
    @Query('imobiliariaId') tenantId: string,
    @Query('search') search: string,
  ) {
    return this.configService.findAll(
      this.getTableName(slug),
      tenantId,
      search,
    );
  }

  @Post(':slug')
  async save(@Param('slug') slug: string, @Body() dto: any) {
    return this.configService.upsert(
      this.getTableName(slug),
      dto,
      dto.imobiliariaId,
    );
  }

  @Delete(':slug/:id')
  async remove(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Query('imobiliariaId') tenantId: string,
  ) {
    return this.configService.remove(this.getTableName(slug), +id, tenantId);
  }
}
