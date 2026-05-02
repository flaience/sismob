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
          if (!connectionString) throw new Error('DATABASE_URL ausente');

          console.log('📡 [SISMOB] Tentando pulso no Supabase...');

          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 2, // Apenas 2 conexões para o boot ser instantâneo
              ssl: 'require',
              connect_timeout: 5, // Se não conectar em 5s, ele explode o erro e libera o boot
            },
          );

          return (drizzle as any)(postgresClient, { schema });
        } catch (e) {
          // ESTA LINHA SALVA O SEU DEPLOY:
          console.error(
            '⚠️ [SISMOB] Banco de dados offline, mas mantendo o servidor ligado para diagnóstico.',
          );
          return null;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
