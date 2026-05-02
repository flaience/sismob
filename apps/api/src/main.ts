import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // O Railway vai injetar 3005 aqui se você configurou na variável
  const port = process.env.PORT || 3005;

  // 🚨 O TIRO DE MISERICÓRDIA NO 502:
  // Você PRECISA passar '0.0.0.0'. Se deixar vazio, ele usa 'localhost'
  // e o Railway não consegue falar com o container.
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SERVIDOR SISMOB ATIVO NA PORTA: ${port}`);
}
bootstrap();
