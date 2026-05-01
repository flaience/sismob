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
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          throw new Error('❌ [SISMOB] DATABASE_URL não configurada.');
        }

        // 1. TRATAMENTO INDUSTRIAL + OTIMIZAÇÃO DE POOL
        // Pegamos a função correta e já injetamos as configurações de performance
        const postgresClient = ((postgres as any).default || postgres)(
          connectionString,
          {
            max: 10,
            ssl: 'require', // <--- ISSO É OBRIGATÓRIO PARA O SUPABASE NO RAILWAY
            idle_timeout: 20,
            connect_timeout: 10,
          },
        );

        // 2. RETORNO DRIZZLE
        // O casting 'as any' garante que o Drizzle aceite o cliente mesmo com mismatch de versão
        return (drizzle as any)(postgresClient, { schema });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
