import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@sismob/database'; // Certifique-se que este import está correto

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_CONNECTION',
      useFactory: () => {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) throw new Error('DATABASE_URL is missing');

        const queryClient = postgres(connectionString);

        // IMPORTANTE: O segundo argumento { schema } é o que habilita o this.db.query
        // Usamos o 'as any' para evitar conflitos de tipos no Monorepo
        return drizzle(queryClient, { schema }) as any;
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
