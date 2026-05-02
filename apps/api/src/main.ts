import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Criamos a instância
  const app = await NestFactory.create(AppModule);

  // 1. CONFIGURAÇÃO DE CORS RADICAL
  // Isso libera Geral: Vercel, Localhost e qualquer navegador.
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: '*',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3000;

  // 2. LIGAR O MOTOR
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SISMOB ONLINE NA PORTA ${port}`);
}
bootstrap();
