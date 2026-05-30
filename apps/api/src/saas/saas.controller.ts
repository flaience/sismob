//src/saas/saas.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Logger,
  Delete,
  Param,
} from '@nestjs/common';
import { SaasService } from './saas.service';

@Controller('saas') // <--- ISSO AQUI É O QUE CRIA A ROTA /saas
export class SaasController {
  private readonly logger = new Logger(SaasController.name);

  constructor(private readonly saasService: SaasService) {}

  @Get()
  async list() {
    return this.saasService.listarTenants();
  }

  @Post() // A inclusão agora cai aqui
  async create(@Body() dto: any) {
    return this.saasService.onboarding(dto);
  }

  @Post('onboarding') // <--- ISSO CRIA /saas/onboarding
  async createTenant(@Body() dto: any) {
    this.logger.log(`🏭 Recebendo Onboarding para: ${dto.nomeEmpresa}`);
    return this.saasService.onboarding(dto);
  }

  @Get('tenants')
  async listTenants() {
    this.logger.log(`📡 Listando todas as imobiliárias para o Super-Admin`);
    return this.saasService.listarTenants();
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    return this.saasService.buscarUmTenant(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.saasService.removerTenant(id);
  }
}
