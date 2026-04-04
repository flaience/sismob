import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('--- DIAGNÓSTICO DE AMBIENTE ---');
  console.log('PORTA:', process.env.PORT);
  console.log(
    'DATABASE_URL PRESENTE:',
    process.env.DATABASE_URL ? '✅ SIM' : '❌ NÃO',
  );
  const app = await NestFactory.create(AppModule);

  // 1. Configuração de CORS para permitir que o seu site na Vercel acesse a API
  app.enableCors({
    origin: true, // Em produção, você pode trocar pelo link sismob.vercel.app
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Filtro de validação global para os formulários (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 3. Definição da porta (O Railway injeta o valor na variável PORT)
  const port = process.env.PORT || 3005;

  // 4. IMPORTANTE: Ouvir no endereço '0.0.0.0' para o Railway liberar o acesso público
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Sismob API rodando em: http://0.0.0.0:${port}`);
}

bootstrap();
