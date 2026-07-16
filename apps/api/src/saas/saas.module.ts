import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FlaienceAdminGuard } from './flaience-admin.guard';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';

@Module({
  imports: [AuthModule],

  controllers: [
    SaasController,
    OrganizationsController,
    ProvisioningController,
  ],

  providers: [
    SaasService,
    OrganizationsService,
    ProvisioningService,
    FlaienceAdminGuard,
    JwtAuthGuard,
  ],

  exports: [SaasService, OrganizationsService, ProvisioningService],
})
export class SaasModule {}
