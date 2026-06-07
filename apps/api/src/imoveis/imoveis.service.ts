import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class ImoveisService {
  // Usamos 'any' no construtor para evitar o mismatch de versão do Drizzle
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. BUSCA ÚNICA COMPLETA (v1.30)
   * Resolve o erro de 'No overload matches' nas tabelas de detalhes
   */
  async findOne(id: number, tenantId: string) {
    try {
      const tableImoveis = schema.imoveis as any;
      const tableMidias = schema.midias as any;
      const tableAtributos = schema.imoveisAtributos as any;

      // A. Busca o Imóvel
      const results = await this.db
        .select()
        .from(tableImoveis)
        .where(
          and(eq(tableImoveis.id, id), eq(tableImoveis.tenant_id, tenantId)),
        )
        .limit(1);

      if (results.length === 0) return null;
      const imovel = results[0];

      // B. Busca as Mídias vinculadas (Aqui o erro morre)
      const midias = await this.db
        .select()
        .from(tableMidias)
        .where(eq(tableMidias.imovel_id, id));

      // C. Busca os Atributos vinculados (Aqui o erro morre)
      const atributos = await this.db
        .select()
        .from(tableAtributos)
        .where(eq(tableAtributos.imovel_id, id));

      // Retorna o objeto unificado para o Frontend
      return {
        ...imovel,
        midias: midias || [],
        atributos: atributos.map((a: any) => a.atributo_id),
      };
    } catch (e: any) {
      console.error('❌ [SISMOB] Erro ao carregar imóvel:', e.message);
      return null;
    }
  }

  /**
   * 2. MOTOR DE UPSERT ATÔMICO
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
        const tableMidias = schema.midias as any;
        const tableAtributos = schema.imoveisAtributos as any;

        // Montagem do endereço industrial (conforme v5.1)
        const rua = endereco?.logradouro || dadosRestantes.logradouro || '';
        const num = endereco?.numero || dadosRestantes.numero || 'SN';
        const bairro = endereco?.bairro || dadosRestantes.bairro || '';
        const cidade = endereco?.cidade || dadosRestantes.cidade || '';
        const endStr = `${rua}, ${num} - ${bairro}, ${cidade}`;

        const payload = {
          ...dadosRestantes,
          logradouro: rua,
          numero: num,
          bairro: bairro,
          cidade: cidade,
          endereco_original: endStr,
          tenant_id: tenantId,
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

        // SALVA ATRIBUTOS (O seu Cardápio)
        if (atributos && Array.isArray(atributos)) {
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));
          const inserts = atributos.map((aid: any) => ({
            imovel_id: imovelId,
            atributo_id: Number(aid),
          }));
          if (inserts.length > 0)
            await tx.insert(tableAtributos).values(inserts);
        }

        // SALVA MÍDIAS
        if (midias && Array.isArray(midias)) {
          await tx
            .delete(tableMidias)
            .where(eq(tableMidias.imovel_id, imovelId));
          const inserts = midias.map((m: any, idx: number) => ({
            imovel_id: imovelId,
            url: m.url,
            tipo: m.tipo || 'foto_interna',
            is_capa: m.is_capa || idx === 0,
            ordem: idx,
          }));
          if (inserts.length > 0) await tx.insert(tableMidias).values(inserts);
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  /**
   * 3. LISTAGEM DO GRID
   */
  async findAll(tenantId: string) {
    const table = schema.imoveis as any;
    return await this.db
      .select()
      .from(table)
      .where(eq(table.tenant_id, tenantId))
      .orderBy(desc(table.id));
  }

  /**
   * 4. EXCLUSÃO REAL
   */
  async remove(id: number, tenantId: string) {
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
  }
}
