//src/pessoas/pessoas.service.ts
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
import * as bcrypt from 'bcryptjs';
@Injectable()
export class PessoasService {
  private supabaseAdmin: SupabaseClient;
  // apps/api/src/pessoas/pessoas.service.ts

  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {
    // 🛡️ BUSCA RESILIENTE: Tenta com e sem o prefixo NEXT_PUBLIC_
    const url =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error(
        '❌ [SISMOB] ERRO CRÍTICO: SUPABASE_URL ou SERVICE_ROLE_KEY não configurados no Railway!',
      );
    }

    this.supabaseAdmin = createClient(url!, key!);
  }

  // 1. BUSCA POR PAPEL (O que alimenta os Grids do CRM)
  async findByRole(papel: string, tenantId: string, search?: string) {
    try {
      console.log('======================================');
      console.log('LISTAGEM DE PESSOAS');
      console.log('Papel recebido:', papel);
      console.log('Tenant recebido:', tenantId);
      console.log('Pesquisa recebida:', search);
      console.log('======================================');

      if (!tenantId) {
        throw new Error('tenantId não foi informado na listagem de pessoas.');
      }

      if (!papel) {
        throw new Error('papel não foi informado na listagem de pessoas.');
      }

      const table = schema.pessoas as any;

      const conds = [
        eq(table.tenant_id, tenantId),
        eq(table.papel, String(papel)),
      ];

      if (search?.trim()) {
        conds.push(ilike(table.nome, `%${search.trim()}%`) as any);
      }

      const result = await this.db
        .select()
        .from(table)
        .where(and(...conds));

      console.log('Registros encontrados:', result.length);
      console.log(
        result.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          papel: item.papel,
          tenant_id: item.tenant_id,
        })),
      );

      return result;
    } catch (e: any) {
      console.error('❌ Erro findByRole:', e);

      throw new InternalServerErrorException(
        `Erro ao listar pessoas: ${e.message}`,
      );
    }
  }

  // 2. BUSCA UM ÚNICO (Com suporte a Endereço Lego)
  async findOne(id: string, tenantId: string) {
    try {
      const pessoasTable = schema.pessoas as any;
      const enderecosTable = schema.enderecos as any;

      const registros = await this.db
        .select({
          pessoa: pessoasTable,
          endereco: enderecosTable,
        })
        .from(pessoasTable)

        .leftJoin(
          enderecosTable,
          eq(pessoasTable.endereco_id, enderecosTable.id),
        )
        .limit(1);

      const registro = registros[0];

      if (!registro?.pessoa) {
        throw new NotFoundException('Pessoa não encontrada para este tenant.');
      }

      console.log('PESSOA:', registro.pessoa);
      console.log('ENDEREÇO:', registro.endereco);

      return {
        ...registro.pessoa,
        endereco: {
          id: registro.endereco?.id ?? null,
          cep: registro.endereco?.cep ?? '',
          logradouro: registro.endereco?.logradouro ?? '',
          numero: registro.endereco?.numero ?? '',
          bairro: registro.endereco?.bairro ?? '',
          cidade: registro.endereco?.cidade ?? '',
          estado: registro.endereco?.estado ?? '',
        },
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('❌ Erro ao carregar pessoa e endereço:', error);

      throw new InternalServerErrorException(
        `Erro ao carregar pessoa: ${error.message}`,
      );
    }
  }

  // 3. MOTOR DE GRAVAÇÃO (SAVE / UPSERT) COM ENDEREÇO LEGO
  // apps/api/src/pessoas/pessoas.service.ts
  async save(dto: any, tenantId: string) {
    try {
      if (!tenantId) {
        throw new Error('Tenant não identificado.');
      }

      return await this.db.transaction(async (tx) => {
        const pessoasTable = schema.pessoas as any;
        const enderecosTable = schema.enderecos as any;

        const isUpdate = Boolean(dto.id && dto.id !== 'undefined');

        let enderecoId = dto.endereco_id || dto.endereco?.id || null;

        const endereco = dto.endereco || {};

        const possuiEndereco = Boolean(
          endereco.cep ||
          endereco.logradouro ||
          endereco.numero ||
          endereco.bairro ||
          endereco.cidade ||
          endereco.estado,
        );

        if (possuiEndereco) {
          const enderecoPayload = {
            cep: endereco.cep || null,
            logradouro: endereco.logradouro || null,
            numero: endereco.numero || null,
            bairro: endereco.bairro || null,
            cidade: endereco.cidade || null,
            estado: endereco.estado || null,
          };

          if (enderecoId) {
            const [enderecoAtualizado] = await tx
              .update(enderecosTable)
              .set(enderecoPayload)
              .where(eq(enderecosTable.id, Number(enderecoId)))
              .returning();

            if (!enderecoAtualizado) {
              throw new Error('Endereço não encontrado para atualização.');
            }

            enderecoId = enderecoAtualizado.id;
          } else {
            const [novoEndereco] = await tx
              .insert(enderecosTable)
              .values(enderecoPayload)
              .returning();

            if (!novoEndereco) {
              throw new Error('Não foi possível criar o endereço.');
            }

            enderecoId = novoEndereco.id;
          }
        }

        const pessoaPayload = {
          tenant_id: tenantId,
          unidade_id: dto.unidade_id ? Number(dto.unidade_id) : null,
          endereco_id: enderecoId ? Number(enderecoId) : null,
          nome: dto.nome,
          email: dto.email,
          documento: dto.documento || '000.000.000-00',
          telefone: dto.telefone || null,
          papel: dto.papel,
          tipo: dto.tipo || 'f',
          cargo: dto.cargo || null,
          updated_at: new Date(),
        };

        if (isUpdate) {
          const [pessoaAtualizada] = await tx
            .update(pessoasTable)
            .set(pessoaPayload)
            .where(
              and(
                eq(pessoasTable.id, dto.id),
                eq(pessoasTable.tenant_id, tenantId),
              ),
            )
            .returning();

          if (!pessoaAtualizada) {
            throw new Error('Pessoa não encontrada ou não pertence ao tenant.');
          }

          return {
            id: pessoaAtualizada.id,
            success: true,
            operation: 'updated',
          };
        }

        const [novaPessoa] = await tx
          .insert(pessoasTable)
          .values(pessoaPayload)
          .returning();

        if (!novaPessoa) {
          throw new Error('Não foi possível criar a pessoa.');
        }

        return {
          id: novaPessoa.id,
          success: true,
          operation: 'created',
        };
      });
    } catch (error: any) {
      console.error('❌ Erro na gravação de pessoa e endereço:', error);

      throw new InternalServerErrorException(
        `Erro na gravação Lego: ${error.message}`,
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
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(novaSenha, salt);
      const table = schema.pessoas as any;

      // 1. Acha o usuário pelo e-mail
      const res = await this.db
        .select()
        .from(table)
        .where(eq(table.email, email))
        .limit(1);
      if (res.length === 0) throw new Error('Usuário não cadastrado.');

      const userId = res[0].id;

      // 2. Grava no NOSSO banco (Soberania Digital)
      await this.db
        .update(table)
        .set({ senha_hash: hash })
        .where(eq(table.id, userId));

      // 3. Força no Supabase Auth (Admin Bypass)
      const { error } = await this.supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password: novaSenha,
          email_confirm: true,
        },
      );

      if (error) throw new Error('Erro no Supabase: ' + error.message);

      return { success: true };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async resetSoberano(email: string, novaSenha: any) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(novaSenha, salt);
      const table = schema.pessoas as any;

      // 1. Busca a pessoa pelo e-mail no NOSSO banco
      const res = await this.db
        .select()
        .from(table)
        .where(eq(table.email, email))
        .limit(1);
      if (res.length === 0)
        throw new Error('E-mail não localizado na base do Sismob.');

      const userId = res[0].id;

      // 2. Atualiza a senha no NOSSO Banco (senha_hash)
      await this.db
        .update(table)
        .set({ senha_hash: hash })
        .where(eq(table.id, userId));

      // 3. Força a atualização no Supabase Auth (Bypass total de e-mail e link)
      const { error } = await this.supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password: novaSenha,
          email_confirm: true,
        },
      );

      if (error) throw new Error('Supabase Admin Error: ' + error.message);

      return { success: true };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  // No seu PessoasService.ts

  async gerarCodigoRecuperacao(email: string) {
    // 1. O Supabase manda o código de 6 dígitos pro e-mail do cara
    // Ele gerencia o Rate Limit e a entrega. Nós só disparamos.
    const { error } = await this.supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });
    if (error)
      throw new InternalServerErrorException(
        'Erro ao gerar protocolo: ' + error.message,
      );
    return { success: true, message: 'Código enviado.' };
  }

  async validarProtocoloEResetar(email: string, token: string, novaSenha: any) {
    try {
      // 🛡️ SEGURANÇA INDUSTRIAL: Validamos o código ANTES de qualquer troca
      const { data, error: verifyError } =
        await this.supabaseAdmin.auth.verifyOtp({
          email,
          token, // O código de 6 dígitos que o usuário digitou
          type: 'recovery',
        });

      if (verifyError)
        throw new Error('Código de segurança inválido ou expirado.');

      // Se o código é válido, o Supabase nos devolve o User ID
      const userId = data.user.id;

      // Agora sim, com a identidade PROVADA, trocamos no banco e no auth
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(novaSenha, salt);

      await this.db
        .update(schema.pessoas as any)
        .set({ senha_hash: hash })
        .where(eq((schema.pessoas as any).id, userId));

      await this.supabaseAdmin.auth.admin.updateUserById(userId, {
        password: novaSenha,
      });

      return { success: true };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
