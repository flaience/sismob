"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. CORS configurado para aceitar o seu domínio da Vercel
    app.enableCors({
        origin: ['https://sismob.flaience.com', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    // 2. O Railway injeta a porta automaticamente na variável PORT
    const port = process.env.PORT || 3005;
    // 3. O SEGREDO: '0.0.0.0' permite conexões externas no Railway
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Sismob API rodando na porta: ${port}`);
}
bootstrap();
