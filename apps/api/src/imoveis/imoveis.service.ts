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
      const table = schema.imoveis as any;
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

  // 3. SALVAMENTO ATÔMICO (Imóvel + Atributos)
  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const { id, atributos, ...dadosImovel } = dto;
        const table = schema.imoveis as any;
        const tableAtributos = schema.imoveisAtributos as any;

        const payload = {
          ...dadosImovel,
          tenant_id: tenantId,
          updated_at: new Date(),
        };

        let imovelId = id;

        if (id && id !== 'undefined') {
          await tx.update(table).set(payload).where(eq(table.id, id));
        } else {
          const [novo] = await tx.insert(table).values(payload).returning();
          imovelId = novo.id;
        }

        // VÍNCULO DE ATRIBUTOS (Many-to-Many)
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
        console.error('❌ [DB ERROR] Falha ao salvar imóvel:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  // 4. EXCLUSÃO COM LIMPEZA (Mata o Erro 500 de Constraint)
  async remove(id: number, tenantId: string) {
    try {
      const tableImoveis = schema.imoveis as any;
      const tableMidias = schema.midias as any;
      const tableAtributos = schema.imoveisAtributos as any;

      // Limpa as tabelas filhas primeiro para evitar erro de Foreign Key
      await this.db.delete(tableMidias).where(eq(tableMidias.imovel_id, id));
      await this.db
        .delete(tableAtributos)
        .where(eq(tableAtributos.imovel_id, id));

      // Deleta o imóvel principal garantindo que pertence ao tenant
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
