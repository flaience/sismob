import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. Criamos o app
  const app = await NestFactory.create(AppModule);

  // 2. Configurações básicas
  app.enableCors({ origin: '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 3. O SEGREDO DO RAILWAY:
  // O Railway exige que você use a variável PORT que eles enviam.
  const port = process.env.PORT || 3005;

  // 4. LIGAR IMEDIATAMENTE
  // '0.0.0.0' é obrigatório.
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SERVIDOR LIGADO COM SUCESSO NA PORTA: ${port}`);
}
bootstrap();
