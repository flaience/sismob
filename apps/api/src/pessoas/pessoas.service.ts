import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, ilike, or } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  // 1. Usamos 'any' no banco para evitar conflito de versão do Drizzle entre pacotes
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  // 2. Busca por ID Único (Resolvendo erro do Controller)
  // apps/api/src/pessoas/pessoas.service.ts

  // Procure o método findOne e substitua por este:
  // 1. BUSCA ÚNICA (Blindada)
  async findOne(id: string, tenantId: string) {
    if (!id || id === 'undefined' || !tenantId || tenantId === 'undefined')
      return null;

    try {
      const tablePessoas = schema.pessoas as any;
      const tableEnderecos = schema.enderecos as any;

      // 1. BUSCA COM JOIN (Une Pessoa + Endereço em um único tiro)
      const results = await this.db
        .select()
        .from(tablePessoas)
        .leftJoin(tableEnderecos, eq(tableEnderecos.pessoa_id, tablePessoas.id))
        .where(
          and(eq(tablePessoas.id, id), eq(tablePessoas.tenant_id, tenantId)),
        )
        .limit(1);

      if (results.length === 0) return null;

      // 2. FORMATAÇÃO INDUSTRIAL: Transforma o resultado do Join em um objeto único
      // O Drizzle retorna { pessoas: {...}, enderecos: {...} }
      // Nós transformamos em { ...pessoas, endereco: {...} } para o Frontend ler fácil
      const registro = results[0];
      return {
        ...registro.pessoas,
        endereco: registro.enderecos || {
          cep: '',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
        },
      };
    } catch (error: any) {
      console.error(
        '❌ [SISMOB] Erro ao carregar perfil completo:',
        error.message,
      );
      return null;
    }
  }
  // 3. Salvar (Inclusão e Alteração) - RECEBE 2 ARGUMENTOS
  async save(dto: any, tenantId: string) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const { id, endereco, ...dados } = dto;

        // 1. MAPEAMENTO DE TABELAS (CASTING DE ESCUDO)
        // Isso mata os erros de 'No overload matches' em todo o método
        const tablePessoas = schema.pessoas as any;
        const tableEnderecos = schema.enderecos as any;
        const tableUnidades = schema.unidades as any;

        // 2. RESOLVE UNIDADE_ID (Garante a Foreign Key)
        let unidadeIdFinal = dados.unidade_id ? Number(dados.unidade_id) : null;

        if (!unidadeIdFinal) {
          const matriz = await tx
            .select()
            .from(tableUnidades)
            .where(
              and(
                eq(tableUnidades.tenant_id, tenantId),
                eq(tableUnidades.is_matriz, true),
              ),
            )
            .limit(1);
          unidadeIdFinal = matriz[0]?.id || null;
        }

        if (!unidadeIdFinal) throw new Error('Unidade Matriz não encontrada.');

        // 3. HIGIENIZAÇÃO DE DADOS
        const payloadPessoa = {
          ...dados,
          tenant_id: tenantId,
          unidade_id: unidadeIdFinal,
          documento: dados.documento || `LEAD-${Date.now()}`,
          tipo: dados.tipo === 'f' || dados.tipo === 'j' ? dados.tipo : 'f',
          updated_at: new Date(),
        };

        let pessoaId = id;

        // 4. SALVA OU ATUALIZA PESSOA (Master)
        if (id && id !== 'undefined') {
          await tx
            .update(tablePessoas)
            .set(payloadPessoa)
            .where(eq(tablePessoas.id, id));
        } else {
          const [nova] = await tx
            .insert(tablePessoas)
            .values(payloadPessoa)
            .returning();
          pessoaId = nova.id;
        }

        // 5. SALVA OU ATUALIZA ENDEREÇO (Detail)
        // O erro de "schema.enderecos.pessoa_id" morre aqui!
        if (endereco && (endereco.cep || endereco.logradouro)) {
          // Limpa rastro anterior
          await tx
            .delete(tableEnderecos)
            .where(eq(tableEnderecos.pessoa_id, pessoaId));

          // Insere novo rastro vinculado à pessoaId
          await tx.insert(tableEnderecos).values({
            ...endereco,
            pessoa_id: pessoaId,
            numero: endereco.numero || 'SN',
            bairro: endereco.bairro || 'N/A',
            cidade: endereco.cidade || 'N/A',
            estado: endereco.estado || '??',
          });
        }

        return { id: pessoaId, success: true };
      } catch (e: any) {
        console.error('❌ [DB FATAL ERROR]:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  // 4. Identificação por Host
  async findImobiliariaByHost(host: string) {
    // Proteção contra host vazio
    if (!host || host === 'undefined') return null;

    try {
      const table = schema.tenants as any;
      const results = await this.db
        .select()
        .from(table)
        .where(
          or(
            eq(table.dominio_customizado, host),
            eq(table.slug, host.split('.')[0]),
          ),
        )
        .limit(1);

      return results.length > 0 ? results[0] : null;
    } catch (e) {
      return null;
    }
  }
  // 5. Busca por Papel
  async findByRole(papel: string, tenantId: string, search?: string) {
    try {
      const table = schema.pessoas as any;
      let conds = [eq(table.papel, papel), eq(table.tenant_id, tenantId)];

      // FILTRO DE BUSCA INDUSTRIAL
      if (search && search !== 'undefined') {
        conds.push(ilike(table.nome, `%${search}%`));
      }

      return await this.db
        .select()
        .from(table)
        .where(and(...conds));
    } catch (error: any) {
      console.error('❌ [SISMOB] Erro ao filtrar:', error.message);
      return [];
    }
  }

  // 6. Remover
  async remove(id: string, tenantId: string) {
    const table = schema.pessoas as any;
    return await this.db
      .delete(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)));
  }
}
