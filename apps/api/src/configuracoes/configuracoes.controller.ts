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
    const map: Record<string, string> = {
      bancos: 'bancos',
      unidades: 'unidades',
      'grupos-caixa': 'grupoCaixa',
      atributos: 'atributos',
      'atributos-itens': 'atributos',
      // O TIRO DE MISERICÓRDIA:
      // Converte o slug com traço para o nome exato da variável exportada no schema.ts
      'categorias-atributos': 'categoriasAtributos',
    };

    const table = map[slug];

    if (!table) {
      console.error(`❌ [SISMOB] SLUG NÃO MAPEADO: ${slug}`);
      return slug; // Fallback
    }

    console.log(`🏭 [SISMOB] Mapeando Rota: ${slug} -> Tabela: ${table}`);
    return table;
  }

  @Get(':slug')
  async list(@Param('slug') slug: string, @Query('imobiliariaId') tid: string) {
    const mappedTable = this.getTableName(slug);
    return this.configService.findAll(mappedTable, tid);
  }

  @Post(':slug')
  async save(@Param('slug') slug: string, @Body() dto: any) {
    const mappedTable = this.getTableName(slug);
    // ENVIAMOS O NOME CORRETO (categoriasAtributos) PARA O SERVICE
    return this.configService.upsert(mappedTable, dto, dto.imobiliariaId);
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
