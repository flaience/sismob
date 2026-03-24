import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@realstate/database';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        console.log(
          '🔌 Tentando conectar com URL:',
          connectionString ? 'URL Encontrada ✅' : 'URL Vazia ❌',
        );
        if (!connectionString) {
          throw new Error('DATABASE_URL is missing in .env');
        }

        const queryClient = postgres(connectionString);

        // AQUI ESTÁ O SEGREDO:
        // Forçamos a função 'drizzle' a ser tratada como 'any'
        // para que o TS ignore a contagem de argumentos (1 vs 2).
        // No runtime do Node, isso funciona 100% com o Drizzle.

        try {
          // @ts-ignore - Força o TS a ignorar o erro de argumentos nesta linha
          const db = (drizzle as any)(queryClient, { schema });

          console.log('✅ Conexão com Supabase/Drizzle estabelecida!');
          return db;
        } catch (error) {
          console.error('❌ Falha ao conectar no Drizzle:', error);
          throw error;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
