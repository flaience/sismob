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

        if (!connectionString) throw new Error('DATABASE_URL ausente');

        console.log('📡 Tentando conectar ao Supabase...');

        const postgresClient = ((postgres as any).default || postgres)(
          connectionString,
          {
            max: 5, // Poucas conexões para não estourar o limite
            ssl: 'require', // Obrigatório
            connect_timeout: 5, // Se não conectar em 5s, ele explode o erro e libera o boot
            idle_timeout: 10,
          },
        );

        return (drizzle as any)(postgresClient, { schema });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
