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
    // MAPEAMENTO MANUAL E FORÇADO (Sem chance de erro)
    switch (slug) {
      case 'bancos':
        return 'bancos';
      case 'unidades':
        return 'unidades';
      case 'grupos-caixa':
        return 'grupoCaixa';
      case 'atributos':
        return 'atributos'; // <--- OBRIGA A GRAVAR EM ATRIBUTOS
      case 'categorias-itens':
        return 'categoriasAtributos';
      default:
        return slug;
    }
  }

  @Get(':slug')
  async list(@Param('slug') slug: string, @Query('imobiliariaId') tid: string) {
    const table = this.getTableName(slug);
    return this.configService.findAll(table, tid);
  }

  @Post(':slug')
  async save(@Param('slug') slug: string, @Body() dto: any) {
    const table = this.getTableName(slug);

    // LOG DE SEGURANÇA: Verifique isso no Railway!
    this.logger.log(
      `🏭 Recebido slug: ${slug} | Mapeado para Tabela: ${table}`,
    );

    return this.configService.upsert(table, dto, dto.imobiliariaId);
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
