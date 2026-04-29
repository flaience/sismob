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
  // teste

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
  async findOne(id: string) {
    try {
      const table = schema.pessoas as any;
      // Busca direta pelo ID (UUID)
      const results = await this.db
        .select()
        .from(table)
        .where(eq(table.id, id))
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('❌ Erro ao buscar pessoa por ID:', error.message);
      return null;
    }
  }

  // 4. MOTOR UNIVERSAL: SAVE (Inclusão e Alteração)
  /**
   * MOTOR DE GRAVAÇÃO UNIFICADO (Master/Detail: Pessoa + Endereço)
   */
  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx) => {
      try {
        const isUpdate = !!dto.id;
        let pessoaId = dto.id;

        // 1. Lógica Industrial: Se não vier unidade_id, busca a MATRIZ automaticamente
        let unidadeIdFinal = dto.unidade_id ? Number(dto.unidade_id) : null;

        if (!unidadeIdFinal) {
          const matriz = await tx
            .select()
            .from(schema.unidades as any)
            .where(
              and(
                eq((schema.unidades as any).tenant_id, tenantId),
                eq((schema.unidades as any).is_matriz, true),
              ),
            )
            .limit(1);

          if (matriz.length > 0) {
            unidadeIdFinal = matriz[0].id;
          }
        }

        const dadosPessoa = {
          tenant_id: tenantId,
          unidade_id: unidadeIdFinal, // <--- Agora garantido
          nome: dto.nome,
          email: dto.email,
          documento: dto.documento,
          telefone: dto.telefone,
          tipo: dto.tipo || 'f',
          papel: dto.papel,
          cargo: dto.cargo || null,
          updated_at: new Date(),
        };

        // 2. SALVAR PESSOA (Master)
        if (isUpdate) {
          await tx
            .update(schema.pessoas as any)
            .set(dadosPessoa)
            .where(
              and(
                eq((schema.pessoas as any).id, pessoaId),
                eq((schema.pessoas as any).tenant_id, tenantId),
              ),
            );
        } else {
          const [novaPessoa] = await (tx
            .insert(schema.pessoas as any)
            .values(dadosPessoa)
            .returning() as any);
          pessoaId = novaPessoa.id;
        }

        // 3. SALVAR ENDEREÇO (Detail)
        if (dto.endereco) {
          const { cep, logradouro, numero, bairro, cidade, estado } =
            dto.endereco;

          // Só processa endereço se houver o mínimo de informação
          if (cep || logradouro) {
            // Remove endereço antigo para evitar duplicidade (Sempre limpa antes de gravar o novo)
            await tx
              .delete(schema.enderecos as any)
              .where(eq((schema.enderecos as any).pessoa_id, pessoaId));

            // Insere o novo endereço vinculado à pessoa
            await tx.insert(schema.enderecos as any).values({
              pessoa_id: pessoaId,
              cep: cep || '00000-000',
              logradouro: logradouro || 'Não informado',
              numero: numero || 'S/N',
              bairro: bairro || 'Não informado',
              cidade: cidade || 'Não informada',
              estado: estado || '??',
            });
          }
        }

        console.log(
          `✅ Registro ${isUpdate ? 'atualizado' : 'criado'}: ${dto.nome} (ID: ${pessoaId})`,
        );
        return { id: pessoaId, success: true };
      } catch (error) {
        console.error('❌ Erro na transação de salvar pessoa:', error.message);
        throw new InternalServerErrorException(
          `Falha ao persistir dados: ${error.message}`,
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
