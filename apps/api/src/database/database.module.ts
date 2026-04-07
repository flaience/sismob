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
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) throw new Error('DATABASE_URL is missing');

        const queryClient = postgres(connectionString);

        // O SEGREDO: O segundo argumento { schema } habilita o this.db.query
        // Usamos 'as any' para evitar que o TypeScript trave o build por conflito de versões
        return drizzle(queryClient, { schema }) as any;
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
