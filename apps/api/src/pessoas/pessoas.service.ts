// src/pessoas/pessoas.service.ts

import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, or, ilike, sql } from 'drizzle-orm';
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

  // 1. IDENTIFICAÇÃO PÚBLICA (USADA NO TENANT CONTEXT)
  async findImobiliariaByHost(host: string) {
    try {
      const table = schema.pessoas as any;
      const results = await this.db
        .select()
        .from(table)
        .where(and(eq(table.dominio, host), eq(table.papel, '5')))
        .limit(1);
      return results[0] || null;
    } catch (e) {
      console.error('Erro na identificação:', e.message);
      return null;
    }
  }

  // 2. BUSCA PARA O GRID (COM FILTRO DE NOME/DOC)
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      let conditions = [
        eq(table.imobiliaria_id, imobiliariaId),
        eq(table.papel, papel),
      ];

      if (search) {
        conditions.push(
          or(
            ilike(table.nome, `%${search}%`),
            ilike(table.documento, `%${search}%`),
          ) as any,
        );
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conditions));
    } catch (error) {
      return [];
    }
  }

  // 3. BUSCA UM ÚNICO REGISTRO (PARA CARREGAR FORM DE EDIÇÃO)
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

  // 4. CRIAÇÃO (COM SUPORTE A LOGIN PARA CORRETOR)
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let authUserId = null;

        // Se for Corretor (Papel 1), cria login no Supabase Auth
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

        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUserId || undefined,
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliaria_id: imobiliariaId,
          })
          .returning();

        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoa_id: novaPessoa.id,
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
      console.error('Erro na gravação:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // 5. ATUALIZAÇÃO COMPLETA
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
            updated_at: new Date(),
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
            pessoa_id: id,
          };

          const exist = await tx
            .select()
            .from(tableEnd)
            .where(eq(tableEnd.pessoa_id, id))
            .limit(1);
          if (exist.length > 0) {
            await tx
              .update(tableEnd)
              .set(dadosEnd)
              .where(eq(tableEnd.pessoa_id, id));
          } else {
            await tx.insert(tableEnd).values(dadosEnd);
          }
        }
        return { success: true };
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // 6. REMOÇÃO
  async remove(id: string, imobiliariaId: string) {
    try {
      const table = schema.pessoas as any;
      return await this.db
        .delete(table)
        .where(and(eq(table.id, id), eq(table.imobiliaria_id, imobiliariaId)));
    } catch (e) {
      throw new InternalServerErrorException('Erro ao remover registro.');
    }
  }
}
