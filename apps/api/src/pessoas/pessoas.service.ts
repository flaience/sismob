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

  async findImobiliariaByHost(host: string) {
    const results = await this.db
      .select()
      .from(schema.pessoas as any)
      .where(
        and(
          eq((schema.pessoas as any).dominio, host),
          eq((schema.pessoas as any).papel, '5'),
        ),
      )
      .limit(1);
    return results[0] || null;
  }

  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      const results = await this.db
        .select()
        .from(schema.pessoas as any)
        .where(
          and(
            eq((schema.pessoas as any).imobiliariaId, imobiliariaId),
            eq((schema.pessoas as any).papel, papel),
            search
              ? ilike((schema.pessoas as any).nome, `%${search}%`)
              : undefined,
          ),
        );
      return results;
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, imobiliariaId: string) {
    try {
      console.log(
        `🔎 Buscando detalhes da pessoa: ${id} | Imob: ${imobiliariaId}`,
      );

      // 1. Busca a pessoa de forma direta
      const results = await this.db
        .select()
        .from(schema.pessoas as any)
        .where(
          and(
            eq((schema.pessoas as any).id, id),
            eq((schema.pessoas as any).imobiliariaId, imobiliariaId),
          ),
        )
        .limit(1);

      const pessoa = results[0];

      if (!pessoa) {
        console.warn('⚠️ Pessoa não encontrada no banco.');
        return null;
      }

      // 2. Busca o endereço vinculado (separado para evitar erro de Join)
      const enderecos = await this.db
        .select()
        .from(schema.enderecos as any)
        .where(eq((schema.enderecos as any).pessoaId, id));

      // 3. Devolve tudo unificado (O front espera 'enderecos' como um array)
      const resultadoFinal = { ...pessoa, enderecos };
      // console.log("✅ Dados prontos para envio:", resultadoFinal.nome);

      return resultadoFinal;
    } catch (error) {
      console.error('❌ Erro no findOne:', error.message);
      return null;
    }
  }
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      console.log(
        `📥 Iniciando cadastro unificado. Papel: ${dto.papel} | Imob: ${imobiliariaId}`,
      );

      return await this.db.transaction(async (tx) => {
        let authUserId = null;

        // REGRA PARA CORRETORES (PAPEL 1): Cria login
        if (dto.papel === '1') {
          const { data, error } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email,
              password: 'Sismob@123',
              email_confirm: true,
            });
          if (error) {
            // Se o e-mail já existe no Supabase Auth, pegamos o erro aqui
            throw new Error(`Erro de Autenticação: ${error.message}`);
          }
          authUserId = data.user.id;
        }

        // SALVAMENTO PADRÃO PARA QUALQUER PESSOA (1, 2, 3, 4, 5, 6)
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUserId || undefined,
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: String(dto.papel),
            imobiliaria_id: imobiliariaId, // Nome físico da coluna
          })
          .returning();

        // SALVAMENTO DE ENDEREÇO PADRÃO
        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoa_id: novaPessoa.id, // Nome físico da coluna
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
      console.error('❌ ERRO NO CADASTRO UNIFICADO:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // MÉTODO QUE ESTAVA FALTANDO:
  async updateCompleto(id: string, dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        await tx
          .update(schema.pessoas as any)
          .set({
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq((schema.pessoas as any).id, id),
              eq((schema.pessoas as any).imobiliariaId, imobiliariaId),
            ),
          );

        if (dto.cep) {
          const tableEnd = schema.enderecos as any;
          const existente = await tx
            .select()
            .from(tableEnd)
            .where(eq(tableEnd.pessoaId, id))
            .limit(1);
          const dadosEnd = {
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
          };
          if (existente.length > 0) {
            await tx
              .update(tableEnd)
              .set(dadosEnd)
              .where(eq(tableEnd.pessoaId, id));
          } else {
            await tx.insert(tableEnd).values({ ...dadosEnd, pessoaId: id });
          }
        }
        return { success: true };
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async remove(id: string, imobiliariaId: string) {
    return await this.db
      .delete(schema.pessoas as any)
      .where(
        and(
          eq((schema.pessoas as any).id, id),
          eq((schema.pessoas as any).imobiliariaId, imobiliariaId),
        ),
      );
  }
}
