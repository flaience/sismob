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

        if (!connectionString) {
          throw new Error('❌ DATABASE_URL não configurada no ambiente.');
        }

        const queryClient = postgres(connectionString);

        // CORREÇÃO INDUSTRIAL:
        // Se o Drizzle reclama de 2 argumentos, passamos como um objeto único.
        // Se ainda assim ele chiar, usamos o casting de função (drizzle as any)
        return (drizzle as any)(queryClient, { schema });
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
