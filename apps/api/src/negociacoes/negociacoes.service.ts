import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, sql } from 'drizzle-orm';
import { addDays } from 'date-fns'; // Agora será reconhecido após o pnpm add

@Injectable()
export class NegociacoesService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * MOTOR DE FECHAMENTO (v1.2.0 - Blindado)
   */
  async finalizar(id: number, tenantId: string, usuarioId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        // 1. MAPEAMENTO DE TABELAS (Mata o erro de Overload)
        const tableNegoc = schema.negociacoes as any;
        const tableFormas = schema.formasPagamento as any;
        const tableCondicoes = schema.condicoesPagamento as any;
        const tableTitulos = schema.titulos as any;
        const tableCaixa = schema.caixa as any;

        // 2. BUSCA DADOS DA VENDA
        const [negoc] = await tx.select().from(tableNegoc)
          .where(and(eq(tableNegoc.id, id), eq(tableNegoc.tenant_id, tenantId)))
          .limit(1);

        if (!negoc || negoc.status === 'concluido') throw new Error("Negociação inválida ou já fechada.");

        const comissao = Number(negoc.comissao_total || 0);
        const entrada = Number(negoc.valor_entrada || 0);
        const saldo = comissao - entrada;

        // 3. GERA ENTRADA (Se houver)
        if (entrada > 0 && negoc.forma_entrada_id) {
          const [forma] = await tx.select().from(tableFormas).where(eq(tableFormas.id, negoc.forma_entrada_id)).limit(1);
          
          await tx.insert(tableCaixa).values({
            tenant_id: tenantId,
            usuario_id: usuarioId,
            grupo_caixa_id: negoc.grupo_caixa_id || forma?.grupo_caixa_id,
            conta_bancaria_id: forma?.conta_bancaria_id || null,
            tipo: 'c',
            valor: entrada.toString(),
            historico: `ENTRADA RECEBIDA - NEGOC #${id}`,
            created_at: new Date()
          });
        }

        // 4. GERA PARCELAS (Se houver saldo e condição)
        if (saldo > 0 && negoc.condicao_saldo_id) {
          const [cond] = await tx.select().from(tableCondicoes).where(eq(tableCondicoes.id, negoc.condicao_saldo_id)).limit(1);
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
              data_vencimento: addDays(new Date(), i * (cond?.intervalo_dias || 30)),
              situacao: 'aberto',
              historico: `PARCELA ${i}/${parcelas} - COMISSÃO NEGOC #${id}`
            });
          }
        }

        // 5. ATUALIZA STATUS FINAIS
        await tx.update(tableNegoc).set({ status: 'concluido', updated_at: new Date() }).where(eq(tableNegoc.id, id));
        await tx.update(schema.imoveis as any).set({ status: 'vendido' }).where(eq(schema.imoveis.id, negoc.imovel_id));

        console.log(`✅ [SISMOB] Negociação #${id} finalizada com faturamento.`);
        return { success: true };

      } catch (e: any) {
        console.error("❌ [NEGOC ERROR]:", e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  // Mantenha os métodos findAll, findOne e upsert (com o mesmo padrão de casting)...
}