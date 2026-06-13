import { Module } from '@nestjs/common';
import { PessoasController } from './pessoas.controller';
import { PessoasService } from './pessoas.service';
import { SaasModule } from '../saas/saas.module'; // Importação do módulo vizinho

@Module({
  // AQUI ESTÁ A CONEXÃO: Importamos o SaasModule inteiro
  imports: [SaasModule],
  controllers: [PessoasController],
  providers: [PessoasService],
})
export class PessoasModule {}
