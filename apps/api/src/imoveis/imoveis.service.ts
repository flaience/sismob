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
        // 1. EXTRAÇÃO CIRÚRGICA (Conforme sua versão melhorada)
        const {
          id,
          atributos,
          midias,
          endereco, // O objeto aninhado vindo do SECAO_ENDERECO
          created_at,
          updated_at,
          ...dadosRestantes
        } = dto;

        const tableImoveis = schema.imoveis as any;
        const tableAtributos = schema.imoveisAtributos as any;
        const tableMidias = schema.midias as any;

        // 2. CONSTRUÇÃO DO ENDEREÇO (Sincronia com o seu Schema)
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
          // Mapeamento das colunas físicas da tabela 'imoveis'
          logradouro,
          numero,
          bairro,
          cidade,
          estado,
          cep,
          endereco_original: enderecoString, // <--- RESOLVE O ERRO 500 DEFINITIVAMENTE

          unidade_id: dadosRestantes.unidade_id
            ? Number(dadosRestantes.unidade_id)
            : null,
          proprietario_id: dadosRestantes.proprietario_id || null,

          preco_venda: dadosRestantes.preco_venda
            ? dadosRestantes.preco_venda.toString()
            : '0',
          preco_aluguel: dadosRestantes.preco_aluguel
            ? dadosRestantes.preco_aluguel.toString()
            : '0',
          area_privativa: dadosRestantes.area_privativa
            ? dadosRestantes.area_privativa.toString()
            : '0',

          updated_at: new Date(),
        };

        let imovelId = id;

        // 3. PERSISTÊNCIA DO IMÓVEL
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

        // 4. GRAVAÇÃO DO CARDÁPIO DE ATRIBUTOS (Relacional)
        // 4. GRAVAÇÃO DO CARDÁPIO DE ATRIBUTOS (Relacional)
        if (atributos && Array.isArray(atributos)) {
          console.log(`🔗 [SISMOB] Tentando vincular atributos:`, atributos);

          // Limpa as seleções anteriores para não duplicar ou dar conflito
          await tx
            .delete(tableAtributos)
            .where(eq(tableAtributos.imovel_id, imovelId));

          // Filtramos apenas IDs válidos e convertemos para Number
          const idsValidos = atributos
            .map((id) => Number(id))
            .filter((id) => !isNaN(id) && id > 0);

          if (idsValidos.length > 0) {
            const insertsAtributos = idsValidos.map((attrId: number) => ({
              imovel_id: imovelId,
              atributo_id: attrId,
            }));

            await tx.insert(tableAtributos).values(insertsAtributos);
            console.log(
              `✅ [SISMOB] ${idsValidos.length} atributos vinculados.`,
            );
          }
        }

        // 5. GRAVAÇÃO DE MÍDIAS (Fotos e 360°)
        if (midias && Array.isArray(midias)) {
          await tx
            .delete(tableMidias)
            .where(eq(tableMidias.imovel_id, imovelId));

          const insertsMidias = midias.map((m: any, idx: number) => ({
            imovel_id: imovelId,
            url: m.url,
            tipo: m.tipo || 'foto_interna',
            is_capa: m.is_capa || idx === 0,
            ordem: idx,
          }));

          if (insertsMidias.length > 0) {
            await tx.insert(tableMidias).values(insertsMidias);
          }
        }

        return { id: imovelId, success: true };
      } catch (e: any) {
        console.error('❌ [SISMOB DB FATAL]:', e.message);
        throw new InternalServerErrorException(
          `Falha industrial: ${e.message}`,
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
