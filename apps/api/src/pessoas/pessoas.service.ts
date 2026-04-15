import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';
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

  // 1. BUSCA PARA O GRID (Sincronizado com o Banco)
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      // Usamos os nomes físicos (snake_case) para garantir que o Postgres entenda
      const query = this.db
        .select()
        .from(table)
        .where(
          and(
            eq(table.imobiliaria_id, imobiliariaId),
            eq(table.papel, papel),
            search ? ilike(table.nome, `%${search}%`) : undefined,
          ),
        );
      return await query;
    } catch (error) {
      console.error('❌ Erro ao listar no Grid:', error.message);
      return [];
    }
  }

  // 2. BUSCA UM ÚNICO (Para Edição)
  async findOne(id: string, imobiliariaId: string) {
    try {
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
    } catch (error) {
      return null;
    }
  }

  // 3. GRAVAÇÃO UNIFICADA (Mata o Erro 500)
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let authUserId = null;

        // Se for Corretor (Papel 1), cria login no Supabase
        if (dto.papel === '1') {
          const { data, error } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email,
              password: 'Sismob@123',
              email_confirm: true,
            });
          if (error) throw new Error(`Auth: ${error.message}`);
          authUserId = data.user.id;
        }

        // SALVAMENTO USANDO NOMES FÍSICOS DAS COLUNAS
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUserId || undefined,
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliaria_id: imobiliariaId, // <--- NOME FÍSICO
          })
          .returning();

        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoa_id: novaPessoa.id, // <--- NOME FÍSICO
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
          });
        }
        return novaPessoa;
      });
    } catch (e: any) {
      console.error('❌ ERRO REAL NA GRAVAÇÃO:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // 4. ATUALIZAÇÃO UNIFICADA
  async updateCompleto(id: string, dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        const table = schema.pessoas as any;
        await tx
          .update(table)
          .set({
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo,
          })
          .where(
            and(eq(table.id, id), eq(table.imobiliaria_id, imobiliariaId)),
          );

        if (dto.cep) {
          const tableEnd = schema.enderecos as any;
          const dadosEnd = {
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
            pessoa_id: id, // Nome físico
          };
          // Tenta atualizar, se não houver, insere
          await tx.insert(tableEnd).values(dadosEnd).onConflictDoUpdate({
            target: tableEnd.pessoa_id,
            set: dadosEnd,
          });
        }
        return { success: true };
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // 5. REMOÇÃO
  async remove(id: string, imobiliariaId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.imobiliaria_id, imobiliariaId)));
  }

  // 6. IDENTIFICAÇÃO (Público)
  async findImobiliariaByHost(host: string) {
    const table = schema.pessoas as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.dominio, host), eq(table.papel, '5')))
      .limit(1);
    return results[0] || null;
  }
}
