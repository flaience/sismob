import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';
import { FlaienceAdminGuard } from './flaience-admin.guard';

@Module({
  imports: [AuthModule],

  controllers: [SaasController, ProvisioningController],

  providers: [
    SaasService,
    ProvisioningService,
    FlaienceAdminGuard,
    JwtAuthGuard,
  ],

  exports: [SaasService, ProvisioningService],
})
export class SaasModule {}
