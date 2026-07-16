import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { LicenseController } from './license.controller';
import { FlaienceLicenseService } from './flaience-license.service';
import { TenantLicenseGuard } from './tenant-license.guard';

@Module({
  imports: [AuthModule],

  controllers: [LicenseController],

  providers: [FlaienceLicenseService, TenantLicenseGuard, JwtAuthGuard],

  exports: [FlaienceLicenseService, TenantLicenseGuard],
})
export class LicenseModule {}
