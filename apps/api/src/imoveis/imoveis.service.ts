import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, inArray } from 'drizzle-orm';

@Injectable()
export class ImoveisService {
  // 1. CONSTRUTOR INDUSTRIAL (Bypass de versão do Drizzle)
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * LISTAGEM DO GRID (O que estava faltando e causou o erro)
   */
  async findAll(tenantId: string) {
    try {
      console.log(`📡 [SISMOB] Listando imóveis do tenant: ${tenantId}`);
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

  /**
   * BUSCA ÚNICA (Para Edição)
   */
  async findOne(id: number, tenantId: string) {
    const table = schema.imoveis as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
      .limit(1);
    return results[0] || null;
  }

  /**
   * MOTOR DE GRAVAÇÃO ATÔMICA (Imóvel + Atributos + Endereço)
   */
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

        // Higienização de Endereço (Sincronia com o seu Mapa v4.0)
        const rua = endereco?.logradouro || '';
        const num = endereco?.numero || 'SN';
        const bairro = endereco?.bairro || '';
        const cidade = endereco?.cidade || '';
        const uf = endereco?.estado || '';
        const enderecoString = `${rua}, ${num} - ${bairro}, ${cidade}/${uf}`;

        const payload = {
          ...dadosRestantes,
          tenant_id: tenantId,
          logradouro: rua,
          numero: num,
          bairro: bairro,
          cidade: cidade,
          estado: uf,
          endereco_original: enderecoString,
          unidade_id: dadosRestantes.unidade_id
            ? Number(dadosRestantes.unidade_id)
            : null,
          preco_venda: dadosRestantes.preco_venda
            ? dadosRestantes.preco_venda.toString()
            : '0',
          area_privativa: dadosRestantes.area_privativa
            ? dadosRestantes.area_privativa.toString()
            : '0',
          updated_at: new Date(),
        };

        let imovelId = id;

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

        // VÍNCULO DE ATRIBUTOS (O "Cardápio" que você pediu)
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
        console.error('❌ [SISMOB DB ERROR]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  /**
   * EXCLUSÃO COM LIMPEZA DE RASTRO
   */
  async remove(id: number, tenantId: string) {
    try {
      const tableImoveis = schema.imoveis as any;
      const tableMidias = schema.midias as any;
      const tableAtributos = schema.imoveisAtributos as any;

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
      throw new InternalServerErrorException(
        'Erro ao excluir: verifique dependências.',
      );
    }
  }
}
