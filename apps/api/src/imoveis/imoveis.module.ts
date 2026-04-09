import { Module } from '@nestjs/common';
import { ImoveisController } from './imoveis.controller';
import { ImoveisService } from './imoveis.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [ImoveisController],
  providers: [ImoveisService], // <--- O NestJS vai ler isso aqui
  exports: [ImoveisService],
})
export class ImoveisModule {}
