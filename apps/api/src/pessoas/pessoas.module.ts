import { Module } from '@nestjs/common';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';
import { SaasModule } from '../saas/saas.module';
import { AuthModule } from '../auth/auth.module';
import { LicenseModule } from '../licence/license.module';

@Module({
  imports: [SaasModule, AuthModule, LicenseModule],
  controllers: [PessoasController],
  providers: [PessoasService],
})
export class PessoasModule {}
