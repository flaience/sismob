//src/common/utils/address-factory.ts
import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';

/**
 * MOTOR DE PERSISTÊNCIA LEGO
 * Cria ou atualiza um bloco de endereço e retorna o ID para vínculo
 */
export async function persistirEnderecoLego(
  tx: any,
  dados: any,
  idExistente?: any,
) {
  // Se não tem dados mínimos, não faz nada
  if (!dados || (!dados.cep && !dados.logradouro)) return idExistente || null;

  const table = schema.enderecos as any;
  const payload = {
    cep: dados.cep,
    logradouro: dados.logradouro,
    numero: dados.numero || 'SN',
    bairro: dados.bairro || 'N/A',
    cidade: dados.cidade || 'N/A',
    estado: dados.estado || '??',
  };

  // 🚨 O SEGREDO: Se temos um ID válido, forçamos o UPDATE do bloco existente
  if (idExistente && idExistente !== 'undefined' && Number(idExistente) > 0) {
    console.log(
      '🆙 [SISMOB LEGO] Atualizando bloco de endereço ID:',
      idExistente,
    );
    await tx
      .update(table)
      .set(payload)
      .where(eq(table.id, Number(idExistente)));
    return Number(idExistente);
  } else {
    // Caso contrário, fabrica um novo
    console.log('🆕 [SISMOB LEGO] Criando novo bloco de endereço');
    const [novo] = await tx.insert(table).values(payload).returning();
    return novo.id;
  }
}

/**
 * MOTOR DE LIMPEZA LEGO (A função que estava faltando)
 * Remove o endereço do banco para não deixar registros órfãos
 */
export async function removerEnderecoLego(tx: any, id: number) {
  if (!id) return;
  try {
    const table = schema.enderecos as any;
    await tx.delete(table).where(eq(table.id, id));
    console.log(`🗑️ [SISMOB] Endereço Lego ID ${id} removido com sucesso.`);
  } catch (error) {
    console.warn(`⚠️ [SISMOB] Falha ao remover endereço órfão ID ${id}.`);
  }
}
