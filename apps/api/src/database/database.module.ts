import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres'; // 1. MUDANÇA DE SINTAXE PARA COMPATIBILIDADE
import * as schema from '@sismob/database';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      // No useFactory do seu DatabaseModule
      // Dentro do useFactory do seu DatabaseModule
      // Dentro do seu DatabaseModule (useFactory):
      // Dentro do useFactory no DatabaseModule:
      useFactory: () => {
        try {
          const connectionString = process.env.DATABASE_URL;

          // Configuração de conexão extremamente leve para não travar o boot
          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 1, // Apenas 1 conexão para o teste
              ssl: 'require',
              connect_timeout: 5, // Se não conectar em 5s, não mata o servidor
            },
          );

          console.log('📡 [SISMOB] Tentando pulso no banco...');
          return (drizzle as any)(postgresClient, { schema });
        } catch (e) {
          // SE O BANCO FALHAR, O SERVIDOR CONTINUA VIVO
          console.error(
            '⚠️ [SISMOB] Banco de dados offline, mas mantendo o servidor ligado.',
          );
          return null;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
