import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, ilike, or } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  // 1. Usamos 'any' no banco para evitar conflito de versão do Drizzle entre pacotes
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  // 2. Busca por ID Único (Resolvendo erro do Controller)
  // apps/api/src/pessoas/pessoas.service.ts

  // Procure o método findOne e substitua por este:
  // 1. BUSCA ÚNICA (Blindada)
  async findOne(id: string, tenantId: string) {
    try {
      const table = schema.pessoas as any;
      const results = await this.db
        .select()
        .from(table)
        .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (error: any) {
      console.error('❌ [SISMOB] Erro no findOne:', error.message);
      return null;
    }
  }
  // 3. Salvar (Inclusão e Alteração) - RECEBE 2 ARGUMENTOS
  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const { id, endereco, ...dados } = dto;
        const tablePessoas = schema.pessoas as any;

        // 1. RESOLVE UNIDADE_ID (Evita erro de Foreign Key)
        let unidadeIdFinal = dados.unidade_id ? Number(dados.unidade_id) : null;
        if (!unidadeIdFinal) {
          const matriz = await tx
            .select()
            .from(schema.unidades as any)
            .where(
              and(
                eq(schema.unidades.tenant_id, tenantId),
                eq(schema.unidades.is_matriz, true),
              ),
            )
            .limit(1);
          unidadeIdFinal = matriz[0]?.id || null;
        }

        if (!unidadeIdFinal)
          throw new Error(
            'Unidade Matriz não encontrada. Cadastre uma unidade primeiro.',
          );

        // 2. HIGIENIZAÇÃO DE ENUMS (Mata o erro de Enum "1")
        // Garante que 'tipo' seja apenas 'f' ou 'j'. Se vier '1' ou vazio, assume 'f'.
        const tipoLimpo =
          dados.tipo === 'f' || dados.tipo === 'j' ? dados.tipo : 'f';
        // Garante que 'papel' seja uma string válida do Enum (1 a 7)
        const papelLimpo = String(dados.papel || '2');

        const payloadPessoa = {
          tenant_id: tenantId,
          unidade_id: unidadeIdFinal,
          nome: dados.nome,
          email: dados.email,
          documento: dados.documento || `DOC-${Date.now()}`,
          papel: papelLimpo,
          tipo: tipoLimpo,
          telefone: dados.telefone || null,
          cargo: dados.cargo || null,
          updated_at: new Date(),
        };

        let pessoaId = id;
        if (id && id !== 'undefined') {
          await tx
            .update(tablePessoas)
            .set(payloadPessoa)
            .where(eq(tablePessoas.id, id));
        } else {
          const [nova] = await tx
            .insert(tablePessoas)
            .values(payloadPessoa)
            .returning();
          pessoaId = nova.id;
        }

        // 3. ENDEREÇO (Detail)
        if (endereco && (endereco.cep || endereco.logradouro)) {
          await tx
            .delete(schema.enderecos as any)
            .where(eq(schema.enderecos.pessoa_id, pessoaId));
          await tx.insert(schema.enderecos as any).values({
            ...endereco,
            pessoa_id: pessoaId,
            numero: endereco.numero || 'SN',
            bairro: endereco.bairro || 'N/A',
            cidade: endereco.cidade || 'N/A',
            estado: endereco.estado || '??',
          });
        }

        return { id: pessoaId, success: true };
      } catch (e: any) {
        console.error('❌ [DB ERROR]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  // 4. Identificação por Host
  // async findImobiliariaByHost(host: string) {
  //   const table = schema.tenants as any;
  //   const results = await this.db
  //     .select()
  //     .from(table)
  //     .where(
  //       or(
  //         eq(table.dominio_customizado, host),
  //         eq(table.slug, host.split('.')[0]),
  //       ),
  //     )
  //     .limit(1);
  //   return results[0] || null;
  // }
  async findImobiliariaByHost(host: string) {
    // Proteção contra host vazio
    if (!host || host === 'undefined') return null;

    try {
      const table = schema.tenants as any;
      const results = await this.db
        .select()
        .from(table)
        .where(
          or(
            eq(table.dominio_customizado, host),
            eq(table.slug, host.split('.')[0]),
          ),
        )
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (e) {
      return null;
    }
  }
  // 5. Busca por Papel
  async findByRole(papel: string, tenantId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      let conds = [eq(table.papel, papel), eq(table.tenant_id, tenantId)];

      if (search) conds.push(ilike(table.nome, `%${search}%`));

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (error: any) {
      console.error('❌ [SISMOB] Erro no findByRole:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // 6. Remover
  async remove(id: string, tenantId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
