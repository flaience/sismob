import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // Adicione isso
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Habilita a validação automática para todos os endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3005;

  await app.listen(port);
  console.log(`🚀 API Sismob rodando em: http://localhost:${port}`);
}
bootstrap();
