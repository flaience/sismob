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
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          console.error('❌ [SISMOB] DATABASE_URL AUSENTE!');
          throw new Error('DATABASE_URL ausente');
        }

        console.log('📡 [SISMOB] Tentando pulso no Supabase...');

        // USANDO SINTAXE DE CONEXÃO ÚNICA E RÁPIDA PARA BOOT
        const postgresClient = ((postgres as any).default || postgres)(
          connectionString,
          {
            max: 5, // Mínimo de conexões para o plano Hobby
            ssl: 'require', // OBRIGATÓRIO PARA SUPABASE
            connect_timeout: 10, // Desiste em 10s para não travar o Railway
            idle_timeout: 20,
          },
        );

        console.log('✅ [SISMOB] Conexão com banco preparada.');
        return (drizzle as any)(postgresClient, { schema });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
