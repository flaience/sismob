import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class ImoveisService {
  // Usamos 'any' no construtor para evitar conflito de versão do Drizzle entre pacotes
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  // 1. LISTAGEM INDUSTRIAL (Filtro por Imobiliária)
  async findAll(tenantId: string) {
    try {
      console.log(`📡 [SISMOB] Buscando imóveis do tenant: ${tenantId}`);
      const table = schema.imoveis as any;

      // Select direto para garantir que os dados apareçam no Grid
      return await this.db
        .select()
        .from(table)
        .where(eq(table.tenant_id, tenantId))
        .orderBy(desc(table.id));
    } catch (e: any) {
      console.error('❌ [SISMOB] Erro ao listar imóveis:', e.message);
      return [];
    }
  }

  // 2. BUSCA ÚNICA
  async findOne(id: number, tenantId: string) {
    const table = schema.imoveis as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
      .limit(1);
    return results[0] || null;
  }

  // 3. MOTOR DE UPSERT ATÔMICO (MUDADO DE save PARA upsert)
  // Recebe 'files' para processar as fotos e o tour 360 posteriormente
  async upsert(dto: any, files: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        // 1. DESESTRUTURAÇÃO DE LIMPEZA
        // Extraímos id, atributos, midias e as datas para não dar erro de casting no Drizzle
        const {
          id,
          atributos,
          midias,
          created_at,
          updated_at,
          ...dadosRestantes
        } = dto;

        const tableImoveis = schema.imoveis as any;
        const tableAtributos = schema.imoveisAtributos as any;
        const tableMidias = schema.midias as any;

        // 2. PAYLOAD HIGIENIZADO (Garante Endereço e Números)
        const payload = {
          ...dadosRestantes, // Aqui entram logradouro, bairro, cidade, etc.
          tenant_id: tenantId,
          unidade_id: dadosRestantes.unidade_id
            ? Number(dadosRestantes.unidade_id)
            : null,
          proprietario_id: dadosRestantes.proprietario_id || null,

          // Conversão de valores para o padrão decimal do banco
          preco_venda: dadosRestantes.preco_venda
            ? dadosRestantes.preco_venda.toString()
            : null,
          preco_aluguel: dadosRestantes.preco_aluguel
            ? dadosRestantes.preco_aluguel.toString()
            : null,
          area_privativa: dadosRestantes.area_privativa
            ? dadosRestantes.area_privativa.toString()
            : null,

          updated_at: new Date(),
        };

        let imovelId = id;

        // 3. GRAVAÇÃO DO IMÓVEL (Master)
        if (id && id !== 'undefined') {
          console.log(`🏭 [SISMOB] Atualizando Imóvel: ${id}`);
          await tx
            .update(tableImoveis)
            .set(payload)
            .where(eq(tableImoveis.id, id));
        } else {
          console.log(
            `🏭 [SISMOB] Criando Novo Imóvel para Tenant: ${tenantId}`,
          );
          const [novo] = await tx
            .insert(tableImoveis)
            .values(payload)
            .returning();
          imovelId = novo.id;
        }

        // 4. GRAVAÇÃO DO CARDÁPIO DE ATRIBUTOS (Relacional)
        // O DTO traz um vetor de IDs (ex: [10, 15, 22]) vindo do seu novo seletor
        if (atributos && Array.isArray(atributos)) {
          console.log(
            `🔗 [SISMOB] Vinculando ${atributos.length} atributos ao imóvel ${imovelId}`,
          );

          // Limpa as seleções anteriores (Estratégia de Sincronia)
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));

          // Insere o novo lote
          const insertsAtributos = atributos.map((attrId: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(attrId),
          }));

          if (insertsAtributos.length > 0) {
            await tx.insert(tableAtributos).values(insertsAtributos);
          }
        }

        // 5. GRAVAÇÃO DE MÍDIAS (Fotos)
        // Caso o frontend envie o array de URLs já prontas após o upload
        if (midias && Array.isArray(midias)) {
          await tx
            .delete(tableMidias)
            .where(eq(tableMidias.imovel_id, imovelId));
          const insertsMidias = midias.map((m: any, idx: number) => ({
            imovel_id: imovelId,
            url: m.url,
            tipo: m.tipo || 'foto_interna',
            is_capa: m.is_capa || idx === 0, // Primeira foto é a capa por padrão
            ordem: idx,
          }));
          if (insertsMidias.length > 0)
            await tx.insert(tableMidias).values(insertsMidias);
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [DB FATAL]:', e.message);
        throw new InternalServerErrorException(
          `Falha na persistência industrial: ${e.message}`,
        );
      }
    });
  }

  // 5. EXCLUSÃO COM LIMPEZA (Resolve o erro 500)
  async remove(id: number, tenantId: string) {
    try {
      const tableImoveis = schema.imoveis as any;
      const tableMidias = schema.midias as any;
      const tableAtributos = schema.imoveisAtributos as any;

      // Limpa dependências antes de excluir o pai
      await this.db.delete(tableMidias).where(eq(tableMidias.imovel_id, id));
      await this.db
        .delete(tableAtributos)
        .where(eq(tableAtributos.imovel_id, id));

      return await this.db
        .delete(tableImoveis)
        .where(
          and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
        );
    } catch (e: any) {
      console.error('❌ [DB ERROR] Falha ao excluir imóvel:', e.message);
      throw new InternalServerErrorException(
        'Não foi possível excluir o imóvel pois existem dados vinculados.',
      );
    }
  }
}
