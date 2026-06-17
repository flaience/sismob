import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, sql, or } from 'drizzle-orm';
import { buscarEnderecoVinculado } from '../common/utils/address-resolver';
import { persistirEnderecoLego } from '../common/utils/address-factory';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  async buscarPorHost(host: string) {
    if (!host || host === 'undefined') return null;
    const table = schema.tenants as any;
    const res = await this.db
      .select()
      .from(table)
      .where(
        or(
          eq(table.dominio_customizado, host),
          eq(table.slug, host.split('.')[0]),
        ),
      )
      .limit(1);
    return res[0] || null;
  }

  /**
   * 1. LISTAGEM GLOBAL (Para o Luis)
   */

  async listarTenants() {
    const res = await this.db.execute(sql`
    SELECT id, nome_fantasia, telefone, email_financeiro, nome_conta, status 
    FROM tenants ORDER BY created_at DESC
  `);
    return res.rows || res;
  }
  /**
   * 2. BUSCA ÚNICA (Para o formulário de alteração)
   * Usa o seu Resolutor de Endereço Universal
   */

  async buscarUmTenant(id: string) {
    const res = await this.db.execute(sql`
    SELECT t.*, p.nome as "nomeDono", e.cep, e.logradouro, e.numero, e.bairro, e.cidade, e.estado
    FROM tenants t
    LEFT JOIN pessoas p ON p.tenant_id = t.id AND p.papel = '6'
    LEFT JOIN enderecos e ON e.id = t.endereco_id
    WHERE t.id = ${id} LIMIT 1
  `);
    const row = (res.rows || res)[0];
    if (!row) return null;

    return {
      ...row,
      endereco: {
        cep: row.cep,
        logradouro: row.logradouro,
        numero: row.numero,
        bairro: row.bairro,
        cidade: row.cidade,
        estado: row.estado,
      },
    };
  }
  /**
   * 3. MOTOR DE ONBOARDING (Inclusão e Alteração Inteligente)
   */
  async onboarding(dto: any) {
    // LOG DE RAIO-X (Crucial para você ver no Railway)
    console.log(
      '📦 [SISMOB DEBUG] DTO CHEGANDO NO SERVICE:',
      JSON.stringify(dto),
    );

    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined' && dto.id !== '';

        // 1. GRAVA O ENDEREÇO LEGO (Regra de Ouro)
        const enderecoId = await persistirEnderecoLego(
          tx,
          dto.endereco,
          dto.endereco_id,
        );
        console.log('📍 [SISMOB DEBUG] ID Endereço Lego:', enderecoId);

        if (isUpdate) {
          // 2. UPDATE COM SQL BRUTO (Garante que o campo seja gravado)
          await tx.execute(sql`
          UPDATE tenants SET 
            nome_conta = ${dto.nome_conta},
            nome_fantasia = ${dto.nome_fantasia},
            telefone = ${dto.telefone},
            email_financeiro = ${dto.email_financeiro},
            slug = ${dto.slug},
            url_logo = ${dto.url_logo},
            endereco_id = ${enderecoId},
            updated_at = NOW()
          WHERE id = ${dto.id}
        `);

          // Atualiza o Dono (Pessoa Papel 6)
          const tablePessoas = schema.pessoas as any;
          await tx
            .update(tablePessoas)
            .set({ nome: dto.nomeDono, email: dto.email_financeiro })
            .where(
              and(
                eq(tablePessoas.tenant_id, dto.id),
                eq(tablePessoas.papel, '6'),
              ),
            );

          return { success: true, id: dto.id };
        } else {
          // 3. INSERT COM SQL BRUTO (A Prova de Erros)
          const res = await tx.execute(sql`
          INSERT INTO tenants 
          (nome_conta, nome_fantasia, telefone, email_financeiro, slug, url_logo, endereco_id, status)
          VALUES 
          (${dto.nome_conta}, ${dto.nome_fantasia}, ${dto.telefone}, ${dto.email_financeiro}, ${dto.slug}, ${dto.url_logo}, ${enderecoId}, 'ativo')
          RETURNING id
        `);

          const tenantId = res.rows[0].id;

          // Cria Matriz e Dono usando o motor padrão
          const [unidade] = await tx
            .insert(schema.unidades as any)
            .values({
              tenant_id: tenantId,
              nome: 'MATRIZ',
              is_matriz: true,
            })
            .returning();

          await tx.insert(schema.pessoas as any).values({
            tenant_id: tenantId,
            unidade_id: unidade.id,
            nome: dto.nomeDono || dto.nome_fantasia,
            email: dto.email_financeiro,
            papel: '6',
            documento: '000.000.000-00',
            endereco_id: enderecoId,
          });

          return { success: true, id: tenantId };
        }
      } catch (e) {
        console.error('❌ [SISMOB FATAL] Erro na gravação bruta:', e.message);
        throw new InternalServerErrorException(e.message);
      }
    });
  }

  async findOne(id: number, tenantId: string) {
    const table = schema.imoveis as any;
    const results = await this.db
      .select()
      .from(table)
      .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
      .limit(1);

    // O .select() sem parâmetros traz logradouro, bairro, cidade, etc.
    return results[0] || null;
  }
  /**
   * 4. EXCLUSÃO (O QUE FALTAVA)
   * Resolve o erro TS2339 no Controller
   */
  async removerTenant(id: string) {
    try {
      const table = schema.tenants as any;
      // O banco fará o delete em cascata se configurado no schema
      return await this.db.delete(table).where(eq(table.id, id));
    } catch (e: any) {
      throw new InternalServerErrorException(
        'Existem registros vinculados a esta imobiliária.',
      );
    }
  }
}
