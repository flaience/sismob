import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // OBRIGATÓRIO PARA A VERCEL
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Em produção (Vercel), não usamos app.listen() da mesma forma,
  // mas o @vercel/node precisa que o servidor responda.
  await app.init(); // <--- Inicializa sem travar a porta

  const server = app.getHttpAdapter().getInstance();
  return server;
}

// Exportamos para a Vercel conseguir chamar
export default bootstrap();

// Se o código acima for muito complexo agora, mantenha o listen,
// mas garanta que ele use process.env.PORT
/*
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
*/
