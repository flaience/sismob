//src/pessoas/pessoas.service.ts
import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, or, ilike } from 'drizzle-orm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PessoasService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    @Inject('DRIZZLE_CONNECTION') private db: PostgresJsDatabase<typeof schema>,
  ) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      this.supabaseAdmin = createClient(url, key);
    }
  }

  // 1. IDENTIFICAÇÃO PÚBLICA (DOMÍNIO)
  async findImobiliariaByHost(host: string) {
    try {
      const table = schema.tenants as any;
      // Busca por domínio customizado ou pelo slug
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

      if (results.length === 0) return null;
      return results[0];
    } catch (error) {
      console.error(
        '❌ Erro Crítico na Identificação do Tenant:',
        error.message,
      );
      throw new InternalServerErrorException(
        'Falha ao identificar unidade de negócio.',
      );
    }
  }

  // 2. BUSCA PARA O GRID (MATA O ERRO 500)
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      // Usamos nomes físicos do banco para não haver erro de tradução
      const table = schema.pessoas as any;

      let conds = [
        eq(table.imobiliaria_id, imobiliariaId), // <--- SEMPRE COM UNDERLINE
        eq(table.papel, papel),
      ];

      if (search) {
        conds.push(ilike(table.nome, `%${search}%`) as any);
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (error) {
      console.error('❌ Erro no findByRole:', error.message);
      return [];
    }
  }

  // 3. BUSCA UM ÚNICO (PARA EDIÇÃO)
  async findOne(id: string, imobiliariaId: string) {
    const table = schema.pessoas as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.imobiliaria_id, imobiliariaId)))
      .limit(1);
    const pessoa = results[0];
    if (pessoa) {
      const tableEnd = schema.enderecos as any;
      const ends = await this.db
        .select()
        .from(tableEnd)
        .where(eq(tableEnd.pessoa_id, id));
      return { ...pessoa, enderecos: ends };
    }
    return null;
  }

  // 4. MOTOR UNIVERSAL: SAVE (Inclusão e Alteração)
  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx) => {
      try {
        const isUpdate = !!dto.id;
        let pessoaId = dto.id;

        const dadosPessoa = {
          tenant_id: tenantId,
          unidade_id: dto.unidade_id ? Number(dto.unidade_id) : null,
          nome: dto.nome,
          email: dto.email,
          documento: dto.documento,
          telefone: dto.telefone,
          tipo: dto.tipo || 'f',
          papel: dto.papel,
          updated_at: new Date(),
        };

        // 1. SALVAR PESSOA (Master)
        if (isUpdate) {
          // Usamos 'as any' para evitar o erro de atribuição do PgTable
          await tx
            .update(schema.pessoas as any)
            .set(dadosPessoa)
            .where(eq((schema.pessoas as any).id, pessoaId));
        } else {
          const [novaPessoa] = await (tx
            .insert(schema.pessoas as any)
            .values(dadosPessoa)
            .returning() as any);
          pessoaId = novaPessoa.id;
        }

        // 2. SALVAR ENDEREÇO (Detail)
        if (dto.endereco) {
          const { cep, logradouro, numero, bairro, cidade, estado } =
            dto.endereco;

          // Só salva se houver pelo menos o CEP ou Logradouro
          if (cep || logradouro) {
            // Remove endereço antigo para evitar duplicidade
            await tx
              .delete(schema.enderecos as any)
              .where(eq((schema.enderecos as any).pessoa_id, pessoaId));

            // Insere o novo
            await tx.insert(schema.enderecos as any).values({
              pessoa_id: pessoaId,
              cep,
              logradouro,
              numero,
              bairro,
              cidade,
              estado,
            });
          }
        }

        return { id: pessoaId, success: true };
      } catch (error) {
        console.error('❌ Erro na transação de salvar pessoa:', error.message);
        throw new InternalServerErrorException(
          'Falha ao persistir dados de pessoa e endereço.',
        );
      }
    });
  }

  // 5. REMOÇÃO
  async remove(id: string, imobiliariaId: string) {
    try {
      const table = schema.pessoas as any;

      // ATENÇÃO: No seu schema a coluna é 'tenant_id'.
      // O parâmetro que recebemos é 'imobiliariaId'.
      return await this.db.delete(table).where(
        and(
          eq(table.id, id),
          eq(table.tenant_id, imobiliariaId), // <--- AJUSTADO PARA tenant_id
        ),
      );
    } catch (error) {
      console.error('❌ Erro ao remover pessoa:', error.message);
      throw new InternalServerErrorException(
        'Não foi possível excluir o registro.',
      );
    }
  }
}
