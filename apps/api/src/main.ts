import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 1. Criamos o app
  const app = await NestFactory.create(AppModule);

  // 2. CORS total para não termos erros mentirosos
  app.enableCors({ origin: '*', credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 3. A PORTA QUE O RAILWAY QUER
  const port = process.env.PORT || 3000;

  // 4. O SEGREDO: O listen deve ser a última coisa, mas ele não pode travar.
  // Usamos '0.0.0.0' para o Railway enxergar o container.
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SERVIDOR SISMOB ATIVO NA PORTA: ${port}`);
}
bootstrap();
