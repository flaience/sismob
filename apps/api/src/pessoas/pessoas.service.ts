import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';
import { createClient, SupabaseClient } from '@supabase/supabase-js'; // <--- ADICIONADO
import * as bcrypt from 'bcrypt'; // <--- ADICIONADO
@Injectable()
export class PessoasService {
  private supabaseAdmin: SupabaseClient;
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {
    this.supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  // 1. BUSCA POR PAPEL (O que alimenta os Grids do CRM)
  async findByRole(papel: string, tenantId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      let conds = [eq(table.tenant_id, tenantId), eq(table.papel, papel)];

      if (search) {
        conds.push(ilike(table.nome, `%${search}%`) as any);
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (e) {
      console.error('❌ Erro findByRole:', e.message);
      return [];
    }
  }

  // 2. BUSCA UM ÚNICO (Com suporte a Endereço Lego)
  async findOne(id: string, tenantId: string) {
    const table = schema.pessoas as any;
    const queryApi = this.db.query as any;

    const result = await queryApi.pessoas.findFirst({
      where: and(eq(table.id, id), eq(table.tenant_id, tenantId)),
      with: { endereco: true }, // Se você configurou relations no schema
    });

    if (!result) throw new NotFoundException('Pessoa não encontrada.');
    return result;
  }

  // 3. MOTOR DE GRAVAÇÃO (SAVE / UPSERT) COM ENDEREÇO LEGO
  // apps/api/src/pessoas/pessoas.service.ts
  async save(dto: any, tenantId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let enderecoId = dto.endereco_id;

        // 1. LÓGICA LEGO: Se enviou dados de endereço, gerencia a tabela 'enderecos'
        if (dto.endereco?.cep || dto.cep) {
          const dadosEnd = {
            cep: dto.endereco?.cep || dto.cep,
            logradouro: dto.endereco?.logradouro || dto.logradouro,
            numero: dto.endereco?.numero || dto.numero,
            bairro: dto.endereco?.bairro || dto.bairro,
            cidade: dto.endereco?.cidade || dto.cidade,
            estado: dto.endereco?.estado || dto.estado,
          };

          const tableEnd = schema.enderecos as any;
          if (enderecoId && enderecoId !== 'undefined') {
            await tx
              .update(tableEnd)
              .set(dadosEnd)
              .where(eq(tableEnd.id, Number(enderecoId)));
          } else {
            const [novoEnd] = await (
              tx.insert(tableEnd).values(dadosEnd) as any
            ).returning();
            enderecoId = novoEnd.id;
          }
        }

        // 2. LÓGICA CRM: Salva a Pessoa vinculada ao Tenant e ao Endereço
        const tablePessoa = schema.pessoas as any;
        const isUpdate = !!dto.id && dto.id !== 'undefined';

        const payload = {
          tenant_id: tenantId,
          endereco_id: enderecoId ? Number(enderecoId) : null,
          unidade_id: dto.unidade_id ? Number(dto.unidade_id) : null,
          nome: dto.nome,
          email: dto.email,
          documento: dto.documento || '000.000.000-00',
          telefone: dto.telefone,
          papel: dto.papel, // 6 para Dono, 0 para SuperAdmin (Luis)
          tipo: dto.tipo || 'f',
          cargo: dto.cargo,
        };

        if (isUpdate) {
          await tx
            .update(tablePessoa)
            .set(payload)
            .where(eq(tablePessoa.id, dto.id));
          return { id: dto.id, success: true };
        } else {
          const [novaPessoa] = await (
            tx.insert(tablePessoa).values(payload) as any
          ).returning();
          return { id: novaPessoa.id, success: true };
        }
      });
    } catch (e) {
      throw new InternalServerErrorException(
        'Erro na gravação Lego: ' + e.message,
      );
    }
  }
  // 4. IDENTIFICAÇÃO DO TENANT (O que destrava o site)
  async findImobiliariaByHost(host: string) {
    try {
      const table = schema.tenants as any;
      const res = await this.db
        .select()
        .from(table)
        .where(eq(table.dominio_customizado, host));

      if (res.length > 0) return res[0];

      // Busca por slug se não achar por domínio
      return await this.db
        .select()
        .from(table)
        .where(eq(table.slug, host.split('.')[0]));
    } catch (e) {
      return null;
    }
  }

  async remove(id: string, tenantId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }

  async resetarSenhaIndustrial(email: string, novaSenha: any) {
    try {
      // 1. Criptografia
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(novaSenha, salt);
      const table = schema.pessoas as any;

      // 2. Busca o ID da pessoa
      const res = await this.db
        .select()
        .from(table)
        .where(eq(table.email, email))
        .limit(1);
      if (res.length === 0) throw new Error('Usuário não localizado.');
      const userId = res[0].id;

      // 3. Atualiza nosso Banco (Sismob Control)
      await this.db
        .update(table)
        .set({ senha_hash: hash })
        .where(eq(table.id, userId));

      // 4. Sincroniza Supabase Auth (Bypass no e-mail)
      const { error } = await this.supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password: novaSenha,
          email_confirm: true,
        },
      );

      if (error) throw new Error('Falha Supabase Auth: ' + error.message);

      return { success: true };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
