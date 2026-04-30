import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // Endpoint que o n8n consulta para entender o sistema
  @Get('metadata')
  async getMetadata() {
    return this.aiService.getSystemSchema();
  }

  // Endpoint para a IA buscar instruções de um módulo específico
  @Get('knowledge/:modulo')
  async getKnowledge(@Param('modulo') modulo: string) {
    return this.aiService.getKnowledge(modulo);
  }

  // Endpoint para a IA registrar o que ela fez (Auditoria Industrial)
  @Post('audit')
  async audit(
    @Body() dto: { tenantId: string; usuarioId: string; acao: string },
  ) {
    return this.aiService.logAiAction(dto.tenantId, dto.usuarioId, dto.acao);
  }
}
