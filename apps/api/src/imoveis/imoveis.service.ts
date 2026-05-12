import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, inArray, sql } from 'drizzle-orm'; // 1. IMPORTADO inArray

@Injectable()
export class ImoveisService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async upsert(dto: any, files: any, tenantId: string) {
    // MARCA DE VERSÃO PARA O LUIS CONFERIR NO LOG
    console.log('🚀 [SISMOB SYSTEM] EXECUTANDO UPSERT v185 - FILTRO ATIVO');

    return await this.db.transaction(async (tx: any) => {
      try {
        const {
          id,
          atributos,
          midias,
          endereco,
          created_at,
          updated_at,
          ...dadosRestantes
        } = dto;
        const tableImoveis = schema.imoveis as any;
        const tableAtributos = schema.imoveisAtributos as any;
        const tableDefinicao = schema.atributos as any;

        // 1. CONSTRUÇÃO DO ENDEREÇO (Ajustado para o seu Schema)
        const logradouro = endereco?.logradouro || '';
        const numero = endereco?.numero || 'SN';
        const bairro = endereco?.bairro || '';
        const cidade = endereco?.cidade || '';
        const estado = endereco?.estado || '';
        const cep = endereco?.cep || '';
        const enderecoString = `${logradouro}, ${numero} - ${bairro}, ${cidade}/${estado}`;

        const payload = {
          ...dadosRestantes,
          tenant_id: tenantId,
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          cep,
          endereco_original: enderecoString,
          unidade_id: dadosRestantes.unidade_id
            ? Number(dadosRestantes.unidade_id)
            : null,
          proprietario_id: dadosRestantes.proprietario_id || null,
          updated_at: new Date(),
        };

        let imovelId = id;

        // 2. SALVA O IMÓVEL
        if (id && id !== 'undefined') {
          await tx
            .update(tableImoveis)
            .set(payload)
            .where(eq(tableImoveis.id, id));
        } else {
          const [novo] = await tx
            .insert(tableImoveis)
            .values(payload)
            .returning();
          imovelId = novo.id;
        }

        // 3. O TIRO DE MISERICÓRDIA NO ERRO 500 (Atributos)
        // Limpamos tudo primeiro
        await tx
          .delete(tableAtributos)
          .where(eq(tableAtributos.imovel_id, imovelId));

        if (atributos && Array.isArray(atributos) && atributos.length > 0) {
          // Converte e limpa a lista do frontend
          const idsNumericos = atributos
            .map((val) => Number(val))
            .filter((val) => !isNaN(val) && val > 0);

          if (idsNumericos.length > 0) {
            // BUSCA SENSÍVEL: Só pegamos IDs que REALMENTE existem na tabela atributos
            const existentes = await tx
              .select({ id: tableDefinicao.id })
              .from(tableDefinicao)
              .where(inArray(tableDefinicao.id, idsNumericos));

            const idsValidados = existentes.map((e: any) => e.id);

            if (idsValidados.length > 0) {
              const inserts = idsValidados.map((aid: number) => ({
                imovel_id: imovelId,
                atributo_id: aid,
              }));
              await tx.insert(tableAtributos).values(inserts);
              console.log(
                `✅ [SISMOB] ${idsValidados.length} atributos vinculados.`,
              );
            }
          }
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [DB FATAL v185]:', e.message);
        throw new InternalServerErrorException(
          `Falha industrial: ${e.message}`,
        );
      }
    });
  }
}
