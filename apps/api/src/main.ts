import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// Variável para fazer cache da instância do servidor e economizar recursos
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    // Habilita CORS para o seu frontend Next.js
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Inicializa o NestJS sem travar a porta
    await app.init();

    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// O segredo da Vercel: exportar como um Default Export
export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};
