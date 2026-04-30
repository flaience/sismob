import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres'; // 1. MUDANÇA DE SINTAXE PARA COMPATIBILIDADE
import * as schema from '@sismob/database';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          throw new Error('❌ [SISMOB] DATABASE_URL não configurada.');
        }

        // 2. TRATAMENTO INDUSTRIAL: Garante que pegamos a função independente do bundle
        const postgresClient = ((postgres as any).default || postgres)(
          connectionString,
        );

        // 3. RETORNO DRIZZLE
        return (drizzle as any)(postgresClient, { schema });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
