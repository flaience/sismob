import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, sql } from 'drizzle-orm';
import { addDays } from 'date-fns';

@Injectable()
export class NegociacoesService {
  // Usamos 'any' no construtor para evitar conflito de versão do Drizzle
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. LISTAGEM INDUSTRIAL (Join para o Kanban)
   */
  async findAll(tenantId: string) {
    try {
      const tableNegoc = schema.negociacoes as any;
      const tablePessoas = schema.pessoas as any;
      const tableImoveis = schema.imoveis as any;

      return await this.db
        .select({
          id: tableNegoc.id,
          status: tableNegoc.status,
          intensidade: tableNegoc.intensidade,
          valor_proposta: tableNegoc.valor_proposta,
          cliente_nome: tablePessoas.nome,
          imovel_titulo: tableImoveis.titulo,
        })
        .from(tableNegoc)
        .leftJoin(tablePessoas, eq(tableNegoc.cliente_id, tablePessoas.id))
        .leftJoin(tableImoveis, eq(tableNegoc.imovel_id, tableImoveis.id))
        .where(eq(tableNegoc.tenant_id, tenantId))
        .orderBy(desc(tableNegoc.id));
    } catch (e: any) {
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA (Para o Formulário)
   */
  async findOne(id: number, tenantId: string) {
    const table = schema.negociacoes as any;
    const res = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
      .limit(1);
    return res[0] || null;
  }

  /**
   * 3. UPSERT (Grava Negociação + JSONB)
   */
  async upsert(dto: any, tenantId: string) {
    const table = schema.negociacoes as any;
    const { id, created_at, updated_at, ...dados } = dto;

    const payload = {
      ...dados,
      tenant_id: tenantId,
      updated_at: new Date(),
      // Garante que campos numéricos sejam convertidos
      imovel_id: Number(dados.imovel_id),
      forma_entrada_id: dados.forma_entrada_id
        ? Number(dados.forma_entrada_id)
        : null,
      condicao_saldo_id: dados.condicao_saldo_id
        ? Number(dados.condicao_saldo_id)
        : null,
      forma_saldo_id: dados.forma_saldo_id
        ? Number(dados.forma_saldo_id)
        : null,
    };

    if (id && id !== 'undefined') {
      return await this.db.update(table).set(payload).where(eq(table.id, id));
    } else {
      return await this.db.insert(table).values(payload).returning();
    }
  }

  /**
   * 4. GATILHO DE FECHAMENTO (Motor Financeiro)
   */
  async finalizar(id: number, tenantId: string, usuarioId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const tableNegoc = schema.negociacoes as any;
        const tableFormas = schema.formasPagamento as any;
        const tableCondicoes = schema.condicoesPagamento as any;
        const tableTitulos = schema.titulos as any;
        const tableCaixa = schema.caixa as any;
        const tableImoveis = schema.imoveis as any;

        const [negoc] = await tx
          .select()
          .from(tableNegoc)
          .where(eq(tableNegoc.id, id))
          .limit(1);
        if (!negoc || negoc.status === 'concluido')
          throw new Error('Negociação não elegível.');

        const total = Number(negoc.comissao_total || 0);
        const entrada = Number(negoc.valor_entrada || 0);
        const saldo = total - entrada;

        // A. BAIXA DA ENTRADA (Caixa/Banco)
        if (entrada > 0 && negoc.forma_entrada_id) {
          const [forma] = await tx
            .select()
            .from(tableFormas)
            .where(eq(tableFormas.id, negoc.forma_entrada_id))
            .limit(1);
          await tx.insert(tableCaixa).values({
            tenant_id: tenantId,
            usuario_id: usuarioId,
            valor: entrada.toString(),
            tipo: 'c',
            conta_bancaria_id: forma?.conta_bancaria_id || null,
            historico: `ENTRADA NEGOC #${id}`,
            created_at: new Date(),
          });
        }

        // B. GERAÇÃO DAS PARCELAS (Títulos)
        if (saldo > 0 && negoc.condicao_saldo_id) {
          const [cond] = await tx
            .select()
            .from(tableCondicoes)
            .where(eq(tableCondicoes.id, negoc.condicao_saldo_id))
            .limit(1);
          const parcelas = Number(cond?.qtd_parcelas || 1);
          const valorParcela = (saldo / parcelas).toFixed(2);

          for (let i = 1; i <= parcelas; i++) {
            await tx.insert(tableTitulos).values({
              tenant_id: tenantId,
              pessoa_id: negoc.cliente_id,
              valor_nominal: valorParcela,
              valor_total: valorParcela,
              saldo: valorParcela,
              tipomov: 'c',
              data_vencimento: addDays(
                new Date(),
                i * (cond?.intervalo_dias || 30),
              ),
              situacao: 'aberto',
              historico: `PARCELA ${i}/${parcelas} - NEGOC #${id}`,
            });
          }
        }

        // C. ATUALIZA STATUS
        await tx
          .update(tableNegoc)
          .set({ status: 'concluido' })
          .where(eq(tableNegoc.id, id));
        await tx
          .update(tableImoveis)
          .set({ status: 'vendido' })
          .where(eq(tableImoveis.id, negoc.imovel_id));

        return { success: true };
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  async remove(id: number, tenantId: string) {
    const table = schema.negociacoes as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
