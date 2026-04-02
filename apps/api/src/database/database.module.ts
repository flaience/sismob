import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@sismob/database';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      useFactory: () => {
        // Na Vercel, as variáveis já estão no process.env automaticamente
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
          throw new Error('DATABASE_URL is missing in environment variables');
        }

        // Criar o cliente com configurações de pool para Serverless
        const queryClient = postgres(connectionString, {
          max: 1, // Importante para não estourar conexões no Supabase Free
        });

        // @ts-ignore
        return drizzle(queryClient, { schema });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
