//src/pessoas/pessoas.module.ts
import { Module } from '@nestjs/common';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';
import { AuthModule } from '../auth/auth.module'; // <--- Adicione este import
import { SaasModule } from '../saas/saas.module';

// linha teste
@Module({
  imports: [AuthModule, SaasModule], // <--- IMPORTANTE: Adicione o AuthModule aqui
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
