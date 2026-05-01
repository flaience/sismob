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
      useFactory: () => {
        try {
          const connectionString = process.env.DATABASE_URL;
          if (!connectionString) throw new Error('DATABASE_URL ausente');

          // Configuração de sobrevivência
          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 3, // Reduzimos o pool para o boot ser instantâneo
              ssl: 'require',
              connect_timeout: 5, // Se não conectar em 5s, libera o boot com erro
            },
          );

          console.log('📡 [SISMOB] Tentativa de conexão com o Banco iniciada.');
          return (drizzle as any)(postgresClient, { schema });
        } catch (e) {
          console.error(
            '⚠️ [SISMOB] Falha crítica no banco, mas mantendo o boot: ',
            e.message,
          );
          return null; // Retorna null para o servidor não morrer
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
