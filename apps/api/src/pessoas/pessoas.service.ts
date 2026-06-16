import {
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and, ilike } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

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
  async save(dto: any, tenantId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        let enderecoId = dto.endereco_id;

        // A. TRATA O ENDEREÇO (LEGO)
        if (dto.cep || dto.logradouro) {
          const dadosEnd = {
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
          };

          const tableEnd = schema.enderecos as any;

          if (enderecoId && enderecoId !== 'undefined') {
            await tx
              .update(tableEnd)
              .set(dadosEnd)
              .where(eq(tableEnd.id, Number(enderecoId)));
          } else {
            const [novo] = await (
              tx.insert(tableEnd).values(dadosEnd) as any
            ).returning();
            enderecoId = novo.id;
          }
        }

        // B. TRATA A PESSOA (CRM)
        const tablePessoa = schema.pessoas as any;
        const isUpdate = !!dto.id && dto.id !== 'undefined';

        const dadosPessoa = {
          tenant_id: tenantId,
          unidade_id: dto.unidade_id ? Number(dto.unidade_id) : null,
          endereco_id: enderecoId ? Number(enderecoId) : null,
          nome: dto.nome,
          email: dto.email,
          documento: dto.documento || '000.000.000-00',
          telefone: dto.telefone,
          papel: dto.papel,
          tipo: dto.tipo || 'f',
          cargo: dto.cargo,
        };

        if (isUpdate) {
          await tx
            .update(tablePessoa)
            .set(dadosPessoa)
            .where(
              and(
                eq(tablePessoa.id, dto.id),
                eq(tablePessoa.tenant_id, tenantId),
              ),
            );
          return { id: dto.id, success: true };
        } else {
          const [nova] = await (
            tx.insert(tablePessoa).values(dadosPessoa) as any
          ).returning();
          return { id: nova.id, success: true };
        }
      });
    } catch (e) {
      console.error('❌ Erro fatal no Save Pessoa:', e.message);
      throw new InternalServerErrorException(e.message);
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
}
