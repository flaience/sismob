import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // O Railway vai injetar a porta automaticamente
  const port = process.env.PORT || 3000;
  await app.listen(process.env.PORT || 3005);
  console.log(`🚀 Sismob API rodando na porta ${port}`);
}
bootstrap();
