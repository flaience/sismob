import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlaienceAdminGuard } from './flaience-admin.guard';
import { ProvisioningService } from './provisioning.service';

@Controller('saas/provisioning')
export class ProvisioningController {
  constructor(private readonly provisioningService: ProvisioningService) {}

  @UseGuards(JwtAuthGuard, FlaienceAdminGuard)
  @Post('sismob/:clienteProdutoId')
  provisionarSismob(
    @Param('clienteProdutoId')
    clienteProdutoId: string,
  ) {
    return this.provisioningService.provisionarProdutoSismob(clienteProdutoId);
  }
}
