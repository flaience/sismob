//src/saas/saas.module.ts
import { Module } from '@nestjs/common';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';

@Module({
  controllers: [SaasController],
  providers: [SaasService],
  // O SEGREDO: Exportamos o service para que a 'ponte' funcione
  exports: [SaasService],
})
export class SaasModule {}
