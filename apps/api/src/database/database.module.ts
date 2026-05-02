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
      useFactory: () => {
        try {
          const connectionString = process.env.DATABASE_URL;

          // O SEGREDO: Se o banco demorar mais de 5s, o servidor ignora e liga
          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 2,
              ssl: 'require',
              connect_timeout: 5, // <--- NÃO DEIXE O BOOT TRAVADO AQUI
            },
          );

          console.log('📡 [SISMOB] Driver de banco pronto.');
          return (drizzle as any)(postgresClient, { schema });
        } catch (e) {
          console.error(
            '⚠️ [SISMOB] Erro no banco, mas mantendo boot operacional.',
          );
          return null;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
