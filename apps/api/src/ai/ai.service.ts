import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class AiService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // 1. ENTREGA O MAPA PARA O n8n (Protocolo MCP)
  // Nota: Você pode importar o MAPA_SISMOB aqui ou defini-lo como uma constante
  async getSystemSchema() {
    return {
      versao: '1.0.2',
      plataforma: 'Sismob Industrial',
      instrucao_mestre:
        'Você é o assistente virtual do Luis na Flaience. Sua missão é ajudar corretores a cadastrar imóveis e gerenciar leads usando as ferramentas MCP disponíveis.',
      // Aqui o n8n lerá as entidades e saberá como salvar os dados
    };
  }

  // 2. BUSCA CONTEXTO RAG (Base de Conhecimento)
  async getKnowledge(modulo: string) {
    const table = (schema as any).baseConhecimento;
    if (!table) return [];

    return await this.db.select().from(table).where(eq(table.modulo, modulo));
  }

  // 3. LOG DE ATIVIDADE DA IA (Auditoria)
  async logAiAction(tenantId: string, usuarioId: string, acao: string) {
    const table = (schema as any).logsAtividades;
    return await this.db.insert(table).values({
      tenant_id: tenantId,
      usuario_id: usuarioId,
      operacao: 'i',
      descricao: `[IA AGENT]: ${acao}`,
      created_at: new Date(),
    });
  }
}
