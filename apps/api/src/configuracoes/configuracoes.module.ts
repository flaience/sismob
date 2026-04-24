import { Module } from '@nestjs/common';
import { ConfiguracoesController } from './configuracoes.controller';
import { GenericConfigService } from './generic-config.service';

@Module({
  controllers: [ConfiguracoesController],
  providers: [GenericConfigService],
  exports: [GenericConfigService],
})
export class ConfiguracoesModule {}
