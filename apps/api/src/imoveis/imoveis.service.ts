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
        const { id, atributos, created_at, updated_at, ...dadosImovel } = dto;
        const table = schema.imoveis as any;
        const tableAtributos = schema.imoveisAtributos as any;

        // SANITIZAÇÃO INDUSTRIAL: Garante que os campos de endereço cheguem ao banco
        const payload = {
          ...dadosImovel,
          tenant_id: tenantId,
          // Garante que campos numéricos não vão como string vazia
          unidade_id: dadosImovel.unidade_id
            ? Number(dadosImovel.unidade_id)
            : null,
          preco_venda: dadosImovel.preco_venda
            ? dadosImovel.preco_venda.toString()
            : null,
          area_privativa: dadosImovel.area_privativa
            ? dadosImovel.area_privativa.toString()
            : null,
          updated_at: new Date(),
        };

        let imovelId = id;

        if (id && id !== 'undefined') {
          await tx.update(table).set(payload).where(eq(table.id, id));
        } else {
          const [novo] = await tx.insert(table).values(payload).returning();
          imovelId = novo.id;
        }

        // VÍNCULO DE ATRIBUTOS (O "Cardápio" que você marcou)
        if (atributos && Array.isArray(atributos)) {
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));
          const inserts = atributos.map((attrId: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(attrId),
          }));
          if (inserts.length > 0)
            await tx.insert(tableAtributos).values(inserts);
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [DB FATAL]:', e.message);
        throw new InternalServerErrorException(`Falha no banco: ${e.message}`);
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
