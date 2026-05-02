import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  // 1. PEGA A PORTA DO RAILWAY
  const port = process.env.PORT || 3000;

  // 2. ESCUTA EM TODAS AS INTERFACES (Obrigatório para container)
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 SERVIDOR SISMOB ATIVO NA PORTA: ${port}`);
}
bootstrap();
