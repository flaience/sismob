import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlaienceLicenseService } from './flaience-license.service';

@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: FlaienceLicenseService) {}

  /**
   * Retorna o estado da licença do tenant autenticado.
   *
   * Esta rota não usa TenantLicenseGuard porque sua finalidade
   * é justamente informar se a licença está ativa ou bloqueada.
   */
  @UseGuards(JwtAuthGuard)
  @Get('current')
  async current(@Req() req: any) {
    const user = req.user;

    if (String(user?.papel ?? '') === '0') {
      return {
        allowed: true,
        state: 'active',
        tenantId: user?.tenantId ?? null,
        product: 'sismob',
        administrativeBypass: true,
        message: 'Acesso administrativo Flaience.',
      };
    }

    return this.licenseService.validateSismobTenant(user?.tenantId);
  }
}
