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

        // 2. CONSTRUÇÃO DO ENDEREÇO
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
          updated_at: new Date(),
        };

        let imovelId = id;

        // 3. SALVA O IMÓVEL
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

        // 4. TIRO DE MISERICÓRDIA NO ERRO DE ATRIBUTOS
        if (atributos && Array.isArray(atributos) && atributos.length > 0) {
          // A. Limpa vínculos antigos
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));

          // B. Converte tudo para número e remove lixo
          const idsNumericos = atributos
            .map((val) => Number(val))
            .filter((val) => !isNaN(val) && val > 0);

          if (idsNumericos.length > 0) {
            // C. BUSCA REAL: Só pegamos os que realmente existem no banco
            const existentes = await tx
              .select({ id: tableDefinicao.id })
              .from(tableDefinicao)
              .where(inArray(tableDefinicao.id, idsNumericos));

            const idsValidados = existentes.map((e: any) => e.id);

            // D. Só insere se o banco confirmou a existência
            if (idsValidados.length > 0) {
              const inserts = idsValidados.map((aid: number) => ({
                imovel_id: imovelId,
                atributo_id: aid,
              }));
              await tx.insert(tableAtributos).values(inserts);
              console.log(
                `✅ [SISMOB] ${idsValidados.length} atributos salvos com sucesso.`,
              );
            }
          }
        } else if (id) {
          // Se desmarcou tudo, apenas limpa
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [DB FATAL]:', e.message);
        throw new InternalServerErrorException(
          `Falha industrial: ${e.message}`,
        );
      }
    });
  }
}
