import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { FilesModule } from './files/files.module'; // <--- VERIFIQUE O CAMINHO
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { SaasModule } from './saas/saas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PessoasModule,
    ImoveisModule,
    FilesModule, // <--- REGISTRADO
    ConfiguracoesModule,

    FinanceiroModule,
    SaasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
