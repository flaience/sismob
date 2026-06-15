//src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { FilesModule } from './files/files.module';
import { ConfiguracoesModule } from './configuracoes/configuracoes.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { SaasModule } from './saas/saas.module';
import { NegociacoesModule } from './negociacoes/negociacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PessoasModule,
    ImoveisModule,
    FilesModule,
    ConfiguracoesModule,
    FinanceiroModule,
    SaasModule,
    NegociacoesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
