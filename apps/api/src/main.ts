import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // LIBERAÇÃO TOTAL DE FRONTEIRA (Mata o erro de CORS)
  app.enableCors({
    origin: true, // Aceita qualquer site (Vercel, Localhost, etc)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3005;

  // 0.0.0.0 é vital para o Railway
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Sismob API rodando na porta: ${port}`);
}
bootstrap();
