import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, or, ilike } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // 1. IDENTIFICAÇÃO PÚBLICA PELO DOMÍNIO
  async findImobiliariaByHost(host: string) {
    try {
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
    } catch (error) {
      console.error('❌ Erro findImobiliariaByHost:', error.message);
      return null;
    }
  }

  // 2. BUSCA COM FILTRO DE PAPEL E PESQUISA
  async findByRole(papel: string, imobiliariaId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      let conditions = [
        eq(table.imobiliariaId, imobiliariaId),
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
      console.error('❌ Erro findByRole:', error.message);
      return [];
    }
  }

  // 3. BUSCA UM ÚNICO REGISTRO (RESOLVE O ERRO DE ENDERECOS)
  async findOne(id: string, imobiliariaId: string) {
    // Forçamos o 'query' a ser any para ele encontrar 'pessoas' e 'enderecos'
    const queryApi = this.db.query as any;

    const result = await queryApi.pessoas.findFirst({
      where: and(
        eq(schema.pessoas.id as any, id),
        eq(schema.pessoas.imobiliariaId as any, imobiliariaId),
      ),
      with: {
        enderecos: true, // Agora o TS não vai mais reclamar aqui
      },
    });

    if (!result) throw new NotFoundException('Registro não encontrado.');
    return result;
  }

  // 4. CRIAÇÃO (PESSOA + ENDEREÇO)
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel,
            imobiliariaId: imobiliariaId,
          })
          .returning();

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
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar registro.');
    }
  }

  // 5. ATUALIZAÇÃO (PESSOA + ENDEREÇO - RESOLVE ERRO DE QUERY)
  async updateCompleto(id: string, dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        // 5.1 Atualiza Pessoa
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

        // 5.2 Atualiza ou Cria Endereço
        if (dto.cep) {
          const queryApi = tx.query as any; // Casting Vital aqui
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
    } catch (error) {
      console.error('❌ Erro no updateCompleto:', error.message);
      throw new InternalServerErrorException('Falha ao atualizar registro.');
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
