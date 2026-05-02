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
      // Dentro do useFactory do seu DatabaseModule:
      useFactory: () => {
        try {
          const connectionString = process.env.DATABASE_URL;
          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 5,
              ssl: 'require',
              connect_timeout: 10,
            },
          );
          console.log('📡 [SISMOB] Driver de banco carregado.');
          return (drizzle as any)(postgresClient, { schema });
        } catch (e) {
          console.error(
            '⚠️ [SISMOB] Banco de dados falhou, mas liberando o boot...',
          );
          return null;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
