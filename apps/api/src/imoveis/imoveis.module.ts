import { Module } from '@nestjs/common';
import { ImoveisService } from './imoveis.service';
import { ImoveisController } from './imoveis.controller';

@Module({
  controllers: [ImoveisController],
  providers: [ImoveisService],
  exports: [ImoveisService], // Permite que outros módulos usem este serviço se necessário
})
export class ImoveisModule {}
