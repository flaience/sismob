import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Esta é a função que a Vercel vai chamar
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Se estivermos na Vercel, não usamos o listen()
  if (process.env.VERCEL) {
    await app.init();
    return app.getHttpAdapter().getInstance();
  }

  // Se estivermos local, usamos a porta 3005
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`🚀 Servidor Local: http://localhost:${port}`);
}

// O segredo para Monorepo na Vercel:
export const handler = async (req: any, res: any) => {
  const instance = await bootstrap();
  return instance(req, res);
};

// Mantém o arranque padrão para o TSX local
if (!process.env.VERCEL) {
  bootstrap();
}
