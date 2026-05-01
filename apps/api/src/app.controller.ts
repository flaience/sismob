import { Controller, Get } from '@nestjs/common';

@Controller() // Sem prefixo, rota raiz
export class AppController {
  @Get()
  ping() {
    return {
      servidor: 'SISMOB ONLINE',
      timestamp: new Date().toISOString(),
      api: 'v1.0.51',
      banco: 'Conectado ao Supabase',
    };
  }
}
