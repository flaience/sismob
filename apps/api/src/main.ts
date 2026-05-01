import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 3005;

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SERVIDOR LIGADO NA PORTA ${port}`);
}

bootstrap();
