import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. LIBERAÇÃO TOTAL DE CORS (Para não haver mais erro 404/Timeout no prefetch)
  app.enableCors({
    origin: true, // Aceita qualquer origem (Vercel, localhost, etc)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3005;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Sismob API rodando na porta: ${port}`);
}
bootstrap();
