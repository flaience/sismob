import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';

/**
 * MOTOR DE PERSISTÊNCIA LEGO
 * Cria ou atualiza um bloco de endereço e retorna o ID para vínculo
 */
export async function persistirEnderecoLego(
  tx: any,
  dados: any,
  idExistente?: number,
) {
  // 1. Se não houver dados reais, retorna o que já existia ou nulo
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

  if (idExistente && idExistente > 0) {
    // 2. Atualiza o bloco de Lego existente
    await tx.update(table).set(payload).where(eq(table.id, idExistente));
    return idExistente;
  } else {
    // 3. Fabrica um novo bloco de Lego e devolve o novo ID
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
