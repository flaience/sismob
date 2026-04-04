import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// apps/api/src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajuste o CORS para aceitar o seu novo domínio oficial
  app.enableCors({
    origin: [
      'https://sismob.flaience.com',
      'http://localhost:3001', // Para você continuar testando localmente
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT || 3005, '0.0.0.0');
}
bootstrap();
