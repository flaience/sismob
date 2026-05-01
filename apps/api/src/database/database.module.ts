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
          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 2, // Apenas 2 conexões para o boot ser leve
              ssl: 'require',
              connect_timeout: 5, // Desiste do banco em 5 segundos
            },
          );

          console.log('📡 [SISMOB] Banco de dados em standby.');
          return (drizzle as any)(postgresClient, { schema });
        } catch (e) {
          console.error(
            '⚠️ [SISMOB] Servidor ligando SEM banco de dados (Modo Emergência)',
          );
          return null;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
