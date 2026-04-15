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
      const table = schema.pessoas as any;
      let conditions = [
        eq(table.imobiliariaId, imobiliariaId),
        eq(table.papel, papel),
      ];
      if (search) {
        conditions.push(ilike(table.nome, `%${search}%`) as any);
      }
      return await this.db
        .select()
        .from(table)
        .where(and(...conditions));
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, imobiliariaId: string) {
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
    if (pessoa) {
      const enderecos = await this.db
        .select()
        .from(schema.enderecos as any)
        .where(eq((schema.enderecos as any).pessoaId, id));
      return { ...pessoa, enderecos };
    }
    return null;
  }

  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let authUserId = dto.id;
        if (dto.papel === '1' && !authUserId) {
          const { data, error } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email,
              password: 'Sismob@123',
              email_confirm: true,
            });
          if (error) throw new Error(error.message);
          authUserId = data.user.id;
        }

        const [nova] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUserId || undefined,
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliariaId,
          })
          .returning();

        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoaId: nova.id,
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
          });
        }
        return nova;
      });
    } catch (e: any) {
      console.error('❌ Erro ao criar:', e.message);
      // CÓDIGO 23505 = VIOLAÇÃO DE CHAVE ÚNICA (DUPLICIDADE)
      if (e.code === '23505' || e.message.includes('unique constraint')) {
        throw new InternalServerErrorException(
          'Este registro (CPF, E-mail ou Telefone) já existe para este papel nesta imobiliária.',
        );
      }
      throw new InternalServerErrorException('Erro ao processar cadastro.');
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
