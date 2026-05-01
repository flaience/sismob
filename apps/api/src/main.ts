import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module'; // O nome do arquivo é minúsculo, mas a classe é MAIÚSCULA

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // CORREÇÃO: Usando a classe correta AppModule
  const app = await NestFactory.create(AppModule);

  // 1. LIBERAÇÃO TOTAL DE CORS (Essencial para o site na Vercel falar com o Railway)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // 2. FORÇANDO A PORTA 3005 (Alinhado com o seu Target Port no Railway)
  const port = process.env.PORT || 3005;

  // OBRIGATÓRIO: '0.0.0.0' para que o Railway consiga rotear o tráfego para o container
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SERVIDOR SISMOB ATIVO NA PORTA: ${port}`);
}
bootstrap();
