import { Module } from '@nestjs/common';
import { FilesService } from './files.service';

@Module({
  providers: [FilesService],
  exports: [FilesService], // <--- ESSENCIAL PARA O IMOVEIS_SERVICE ENXERGAR
})
export class FilesModule {}
