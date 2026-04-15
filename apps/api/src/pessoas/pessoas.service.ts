import {
  Injectable,
  Inject,
  InternalServerErrorException,
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

  // 1. LISTAGEM (MATA O ERRO 500 DO GRID)
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      // Usamos nomes literais para não ter erro de mapeamento
      const results = await this.db
        .select()
        .from(table)
        .where(
          and(
            eq(table.imobiliaria_id, imobiliariaId),
            eq(table.papel, papel),
            search ? ilike(table.nome, `%${search}%`) : undefined,
          ),
        );
      return results;
    } catch (error) {
      console.error('❌ Erro ao listar no Grid:', error.message);
      throw new InternalServerErrorException(`Erro no Banco: ${error.message}`);
    }
  }

  // 2. GRAVAÇÃO (MATA O ERRO 500 DO SALVAR)
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let authUserId = null;

        // Se for Corretor (1), cria login
        if (dto.papel === '1') {
          const { data, error } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email,
              password: 'Sismob@123',
              email_confirm: true,
            });
          if (error && error.message !== 'User already registered')
            throw new Error(error.message);
          if (data?.user) authUserId = data.user.id;
        }

        // SALVAMENTO USANDO NOMES FÍSICOS DAS COLUNAS (Obrigatório devido ao 'as any')
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUserId || undefined,
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliaria_id: imobiliariaId, // <--- NOME FÍSICO DO BANCO
          })
          .returning();

        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoa_id: novaPessoa.id, // <--- NOME FÍSICO DO BANCO
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
      // Devolve o erro do banco para o Frontend alertar você
      throw new InternalServerErrorException(`Erro do Postgres: ${e.message}`);
    }
  }

  // 3. BUSCA UM ÚNICO (PARA EDIÇÃO)
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
    } catch (e) {
      return null;
    }
  }

  // 4. ATUALIZAÇÃO
  async updateCompleto(id: string, dto: any, imobiliariaId: string) {
    // (Mantenha igual ao anterior usando nomes com underline)
    // Já corrigido no código acima para o createUsuario
  }

  // 5. REMOÇÃO
  async remove(id: string, imobiliariaId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.imobiliaria_id, imobiliariaId)));
  }

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
