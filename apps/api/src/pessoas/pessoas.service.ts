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
        const { id, endereco, ...dadosPessoa } = dto;
        const tablePessoas = schema.pessoas as any;
        const tableEnderecos = schema.enderecos as any;

        const payloadPessoa = {
          ...dadosPessoa,
          tenant_id: tenantId,
          updated_at: new Date(),
        };

        let pessoaId = id;

        // --- PARTE A: PESSOA ---
        if (id && id !== 'undefined') {
          await tx
            .update(tablePessoas)
            .set(payloadPessoa)
            .where(eq(tablePessoas.id, id));
        } else {
          const [novaPessoa] = await tx
            .insert(tablePessoas)
            .values(payloadPessoa)
            .returning();
          pessoaId = novaPessoa.id;
        }

        // --- PARTE B: ENDEREÇO (Detail) ---
        if (endereco && pessoaId) {
          // Limpa endereço anterior (Garante integridade 1-para-1)
          await tx
            .delete(tableEnderecos)
            .where(eq(tableEnderecos.pessoa_id, pessoaId));

          // Insere o novo
          await tx.insert(tableEnderecos).values({
            ...endereco,
            pessoa_id: pessoaId, // FK vinculada ao registro acima
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
