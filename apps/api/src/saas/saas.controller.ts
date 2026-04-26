import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SaasService } from './saas.service';

@Controller('saas')
export class SaasController {
  constructor(private readonly saasService: SaasService) {}

  @Get('dash')
  async getDash() {
    return this.saasService.getFinanceiroFlaience();
  }

  @Get('tenants')
  async listTenants() {
    return this.saasService.listarTenants();
  }

  @Post('onboarding')
  async createTenant(@Body() dto: any) {
    return this.saasService.onboarding(dto);
  }
}
