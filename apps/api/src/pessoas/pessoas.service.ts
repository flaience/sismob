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
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {
    // INICIALIZA O MOTOR DO SUPABASE PARA CRIAR LOGINS
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      this.supabaseAdmin = createClient(url, key, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  // 1. IDENTIFICAÇÃO PELO DOMÍNIO
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

  // 2. BUSCA POR PAPEL (GRID)
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    const queryApi = this.db.query as any;
    return await queryApi.pessoas.findMany({
      where: and(
        eq(schema.pessoas.imobiliariaId as any, imobiliariaId),
        eq(schema.pessoas.papel as any, papel),
        search ? ilike(schema.pessoas.nome as any, `%${search}%`) : undefined,
      ),
      with: { enderecos: true },
    });
  }

  // 3. BUSCA UM ÚNICO (EDIÇÃO)
  async findOne(id: string, imobiliariaId: string) {
    const queryApi = this.db.query as any;
    const result = await queryApi.pessoas.findFirst({
      where: and(
        eq(schema.pessoas.id as any, id),
        eq(schema.pessoas.imobiliariaId as any, imobiliariaId),
      ),
      with: { enderecos: true },
    });
    return result;
  }

  // 4. CRIAÇÃO COM LOGIN AUTOMÁTICO (UPGRADE SAAS)
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let authUserId = dto.id; // Se já vier um ID (ex: do Supabase direto)

        // SE FOR CORRETOR (1) OU ADMIN (1), CRIA LOGIN NO SUPABASE AUTH
        if (dto.papel === '1' && !authUserId) {
          if (!this.supabaseAdmin)
            throw new Error('Serviço de Auth não configurado no .env');

          const { data, error } =
            await this.supabaseAdmin.auth.admin.createUser({
              email: dto.email,
              password: 'Sismob@123', // Senha padrão inicial
              email_confirm: true,
              user_metadata: { nome: dto.nome, imobiliariaId },
            });

          if (error) throw new Error(`Erro Supabase: ${error.message}`);
          authUserId = data.user.id;
        }

        // SALVA NA TABELA PESSOAS
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            id: authUserId || undefined,
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliariaId: imobiliariaId,
          })
          .returning();

        // SALVA ENDEREÇO
        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoaId: novaPessoa.id,
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
    } catch (e) {
      console.error('❌ Erro ao criar usuário:', e.message);
      throw new InternalServerErrorException(e.message);
    }
  }

  // 5. ATUALIZAÇÃO
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
              eq(schema.pessoas.id as any, id),
              eq(schema.pessoas.imobiliariaId as any, imobiliariaId),
            ),
          );

        if (dto.cep) {
          const queryApi = tx.query as any;
          const enderecoExistente = await queryApi.enderecos.findFirst({
            where: eq(schema.enderecos.pessoaId as any, id),
          });

          const dadosEndereco = {
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
          };

          if (enderecoExistente) {
            await tx
              .update(schema.enderecos as any)
              .set(dadosEndereco)
              .where(eq(schema.enderecos.pessoaId as any, id));
          } else {
            await tx
              .insert(schema.enderecos as any)
              .values({ ...dadosEndereco, pessoaId: id });
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
