import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, desc, sql } from 'drizzle-orm';

@Injectable()
export class FinanceiroService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * MOTOR DE CÁLCULO DE SALDO DINÂMICO
   * Busca o último saldo do banco informado ou do "Dinheiro" (null)
   */
  private async getUltimoSaldo(
    tenantId: string,
    contaBancariaId: number | null,
    tx: any,
  ) {
    const tableCaixa = schema.caixa as any;

    const ultimoRegistro = await tx
      .select()
      .from(tableCaixa)
      .where(
        and(
          eq(tableCaixa.tenant_id, tenantId),
          contaBancariaId
            ? eq(tableCaixa.conta_bancaria_id, contaBancariaId)
            : sql`${tableCaixa.conta_bancaria_id} IS NULL`,
        ),
      )
      .orderBy(desc(tableCaixa.created_at))
      .limit(1);

    return Number(ultimoRegistro[0]?.saldo_atual || 0);
  }

  /**
   * LANÇAMENTO MANUAL (Gasto avulso ou Entrada direta)
   */
  async lancarManual(dto: any, tenantId: string, usuarioId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const tableCaixa = schema.caixa as any;
        const contaId = dto.conta_bancaria_id
          ? Number(dto.conta_bancaria_id)
          : null;

        // 1. Busca saldo anterior
        const saldoAnterior = await this.getUltimoSaldo(tenantId, contaId, tx);

        // 2. Calcula novo saldo
        const valor = Number(dto.valor);
        const novoSaldo =
          dto.tipo === 'c' ? saldoAnterior + valor : saldoAnterior - valor;

        // 3. Grava com Rastro de Usuário
        return await tx
          .insert(tableCaixa)
          .values({
            tenant_id: tenantId,
            usuario_id: usuarioId, // <--- RASTRO AUTOMÁTICO
            grupo_caixa_id: Number(dto.grupo_caixa_id),
            conta_bancaria_id: contaId,
            tipo: dto.tipo,
            valor: valor.toString(),
            historico: dto.historico,
            saldo_anterior: saldoAnterior.toString(),
            saldo_atual: novoSaldo.toString(),
            created_at: new Date(),
          })
          .returning();
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  /**
   * BAIXA DE TÍTULO (Liquidação com rastro)
   */
  async baixarTitulo(dto: any, tenantId: string, usuarioId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const tableTitulos = schema.titulos as any;
        const tableCaixa = schema.caixa as any;

        // 1. Busca e valida o título
        const [titulo] = await tx
          .select()
          .from(tableTitulos)
          .where(
            and(
              eq(tableTitulos.id, dto.tituloId),
              eq(tableTitulos.tenant_id, tenantId),
            ),
          )
          .limit(1);

        if (!titulo || titulo.situacao === 'fechado')
          throw new Error('Título indisponível para baixa.');

        // 2. Atualiza Título
        await tx
          .update(tableTitulos)
          .set({
            situacao: 'fechado',
            data_pagamento: new Date(),
            forma_pagamento: dto.formaPagamento,
            updated_at: new Date(),
          })
          .where(eq(tableTitulos.id, dto.tituloId));

        // 3. Calcula Saldo e Lança no Caixa
        const contaId = titulo.conta_bancaria_id;
        const saldoAnterior = await this.getUltimoSaldo(tenantId, contaId, tx);
        const valor = Number(titulo.valor_total);
        const novoSaldo =
          titulo.tipomov === 'c'
            ? saldoAnterior + valor
            : saldoAnterior - valor;

        await tx.insert(tableCaixa).values({
          tenant_id: tenantId,
          usuario_id: usuarioId, // <--- QUEM BAIXOU O TÍTULO
          titulo_id: titulo.id,
          conta_bancaria_id: contaId,
          tipo: titulo.tipomov,
          valor: valor.toString(),
          historico:
            titulo.tipomov === 'c'
              ? `Rec. Título #${titulo.id}`
              : `Pag. Título #${titulo.id}`,
          saldo_anterior: saldoAnterior.toString(),
          saldo_atual: novoSaldo.toString(),
        });

        return { success: true };
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
  }
}
