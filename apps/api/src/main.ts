import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS configurado para aceitar o seu domínio da Vercel
  app.enableCors({
    origin: ['https://sismob.flaience.com', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 2. O Railway injeta a porta automaticamente na variável PORT
  const port = process.env.PORT || 3005;

  // 3. O SEGREDO: '0.0.0.0' permite conexões externas no Railway
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Sismob API rodando na porta: ${port}`);
}
bootstrap();
