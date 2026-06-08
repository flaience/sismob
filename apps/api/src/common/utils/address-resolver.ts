import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';

/**
 * FERRAMENTA INDUSTRIAL: Busca e formata o endereço de qualquer entidade
 */
export async function buscarEnderecoVinculado(db: any, parentId: string) {
  // Usamos 'as any' para o TypeScript não travar no build do Monorepo
  const tableEnderecos = schema.enderecos as any;

  try {
    const res = await db
      .select()
      .from(tableEnderecos)
      .where(eq(tableEnderecos.pessoa_id, parentId))
      .limit(1);

    const e = res[0];

    // Retorna o objeto padronizado que o SismobFormMaster espera
    return {
      cep: e?.cep || '',
      logradouro: e?.logradouro || '',
      numero: e?.numero || '',
      bairro: e?.bairro || '',
      cidade: e?.cidade || '',
      estado: e?.estado || '',
    };
  } catch (error) {
    return {
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    };
  }
}
