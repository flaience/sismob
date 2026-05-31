import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SaasService } from './saas.service';

@Controller('saas/tenants') // <--- A ROTA MESTRE
export class SaasController {
  private readonly logger = new Logger(SaasController.name);

  constructor(private readonly saasService: SaasService) {}

  // 1. LISTAGEM (Aciona o Grid)
  @Get()
  async list() {
    this.logger.log('📡 Listando imobiliárias para o cockpit');
    return this.saasService.listarTenants();
  }

  // 2. BUSCA ÚNICA (Carrega os dados para o formulário de alteração)
  @Get(':id')
  async one(@Param('id') id: string) {
    this.logger.log(`🔍 Buscando imobiliária ID: ${id}`);
    return this.saasService.buscarUmTenant(id);
  }

  // 3. SALVAMENTO (Inclusão e Alteração Unificadas)
  @Post()
  async save(@Body() dto: any) {
    this.logger.log(
      `🏭 Gravando dados da imobiliária: ${dto.nome_fantasia || dto.nome_conta}`,
    );
    return this.saasService.onboarding(dto);
  }

  // 4. EXCLUSÃO
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`🗑️ Removendo imobiliária ID: ${id}`);
    return this.saasService.removerTenant(id);
  }
}
