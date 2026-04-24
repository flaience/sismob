import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { FilesModule } from './files/files.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module'; // O novo motor genérico

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PessoasModule,
    ImoveisModule,
    FilesModule,
    ConfiguracoesModule,
  ],
})
export class AppModule {}
