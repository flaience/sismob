import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, sql } from 'drizzle-orm';
import axios from 'axios';

@Injectable()
export class ContratosService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * GERAÇÃO DE CONTRATO INTELIGENTE
   * @param templateId ID do modelo (Compra/Venda, Locação, etc)
   * @param dados Objeto com valores para substituir {{NOME}}, {{VALOR}}, etc
   */
  async gerarContrato(templateId: number, dados: any) {
    try {
      // 1. Busca o template usando a forma estável de SELECT
      // O 'as any' no schema e no eq resolve o erro de Overload do TypeScript 5.9
      const results = await this.db
        .select()
        .from(schema.templatesContratos as any)
        .where(eq((schema.templatesContratos as any).id, templateId))
        .limit(1);

      const template = results[0];

      if (!template) {
        throw new NotFoundException('Modelo de contrato não encontrado.');
      }

      // 2. Mágica da Substituição: Transforma {{CHAVE}} no valor real
      let textoFinal = template.conteudo;

      // Percorre todas as chaves enviadas (ex: NOME_PROPRIETARIO, VALOR_IMOVEL)
      Object.keys(dados).forEach((chave) => {
        const regex = new RegExp(`{{${chave}}}`, 'g');
        textoFinal = textoFinal.replace(
          regex,
          String(dados[chave] || '__________'),
        );
      });

      // 3. Integração com n8n (O Motor de PDF)
      const n8nUrl = process.env.N8N_PDF_WORKFLOW;

      if (!n8nUrl) {
        console.warn('⚠️ Link do n8n não configurado. Retornando HTML puro.');
        return {
          html: textoFinal,
          status: 'rascunho',
        };
      }

      // Envia o texto processado para o n8n gerar o PDF profissional
      const res = await axios.post(n8nUrl, {
        texto: textoFinal,
        filename: `contrato_sismob_${Date.now()}.pdf`,
      });

      return {
        linkPdf: res.data.url, // O n8n deve devolver a URL do arquivo no Supabase
        status: 'pronto_para_assinatura',
      };
    } catch (error) {
      console.error('❌ Erro no Motor de Contratos:', error.message);
      throw new InternalServerErrorException(
        `Falha ao gerar documento: ${error.message}`,
      );
    }
  }
}
