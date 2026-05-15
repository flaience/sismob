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

          if (!connectionString) {
            throw new Error('DATABASE_URL não configurada.');
          }

          const postgresClient = ((postgres as any).default || postgres)(
            connectionString,
            {
              max: 5,
              ssl: 'require',
              connect_timeout: 10,
            },
          );

          console.log('📡 [SISMOB] Driver de banco carregado.');

          // O TIRO DE MISERICÓRDIA: Ativamos o logger: true
          // Agora, cada INSERT será impresso no console do Railway
          return (drizzle as any)(postgresClient, {
            schema,
            logger: true,
          });
        } catch (e: any) {
          console.error(
            '⚠️ [SISMOB] Banco de dados falhou, mas liberando o boot: ',
            e.message,
          );
          return null;
        }
      },
    },
  ],
  exports: ['DRIZZLE_CONNECTION'],
})
export class DatabaseModule {}
