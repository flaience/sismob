import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ImoveisModule } from './imoveis/imoveis.module'; // Importando o novo módulo
import { PessoasModule } from './pessoas/pessoas.module'; // Importando

import { AuthModule } from './auth/auth.module'; //
import { FilesModule } from './files/files.module'; // Importando o
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    ImoveisModule,
    PessoasModule,
    FilesModule,
  ],
})
export class AppModule {}
