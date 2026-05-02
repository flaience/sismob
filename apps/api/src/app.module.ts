import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller'; // <--- ADICIONADO PARA DEBUG
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { FilesModule } from './files/files.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { SaasModule } from './saas/saas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PessoasModule,
    SaasModule,
    ImoveisModule,
    SaasModule,
    FilesModule,
    ConfiguracoesModule,
  ],
  controllers: [AppController], // <--- REGISTRADO AQUI PARA O 'PULSO' FUNCIONAR
})
export class AppModule {}
