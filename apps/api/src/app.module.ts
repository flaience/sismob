import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ImoveisModule } from './imoveis/imoveis.module'; // Importando o novo módulo
import { PessoasModule } from './pessoas/pessoas.module'; // Importando

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    DatabaseModule,
    ImoveisModule,
    PessoasModule,
  ],
})
export class AppModule {}
