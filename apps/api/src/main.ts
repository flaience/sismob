import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SISMOB_BOOT');

  try {
    logger.log('1. Iniciando NestFactory...');
    const app = await NestFactory.create(AppModule);

    logger.log('2. Configurando CORS e Pipes...');
    app.enableCors({ origin: '*', credentials: true });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Forçamos 3005 para bater com o seu Target Port no Railway
    const port = process.env.PORT || 3005;

    logger.log(`3. Tentando abrir porta ${port} na interface 0.0.0.0...`);
    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 SUCESSO: Servidor Sismob ouvindo na porta ${port}`);
  } catch (error) {
    logger.error('❌ ERRO FATAL NO BOOTSTRAP:', error.stack);
    process.exit(1); // Força o container a mostrar o erro e reiniciar
  }
}
bootstrap();
