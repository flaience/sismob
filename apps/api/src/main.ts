import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Criamos o app SEM travar no banco
  const app = await NestFactory.create(AppModule);

  // 1. LIBERAÇÃO TOTAL PARA TESTE (CORS NUCLEAR)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 3005;

  // 2. LOG DE SEGURANÇA: Para você ver no Railway que ele ligou
  console.log('🏗️ Iniciando servidor na porta ' + port);

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 SISMOB PRONTO PARA RECEBER CONEXÕES`);
}
bootstrap();
