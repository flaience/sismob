import { Module } from '@nestjs/common';
import { ImoveisController } from './imoveis.controller';
import { ImoveisService } from './imoveis.service';
import { FilesModule } from '../files/files.module'; // <--- OBRIGATÓRIO

@Module({
  imports: [FilesModule], // <--- Permite que o ImoveisService use o FilesService
  controllers: [ImoveisController],
  providers: [ImoveisService],
})
export class ImoveisModule {}
