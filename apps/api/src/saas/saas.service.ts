import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import * as schema from '@sismob/database';
import { eq, and, sql, desc } from 'drizzle-orm';
import { buscarEnderecoVinculado } from '../common/utils/address-resolver';

@Injectable()
export class SaasService {
  constructor(@Inject('DRIZZLE_CONNECTION') private db: any) {}

  /**
   * 1. LISTAGEM GLOBAL (Para o Luis)
   */
  async listarTenants() {
    try {
      const table = schema.tenants as any;
      return await this.db.select().from(table).orderBy(desc(table.created_at));
    } catch (e) {
      return [];
    }
  }

  /**
   * 2. BUSCA ÚNICA (Para o formulário de alteração)
   * Usa o seu Resolutor de Endereço Universal
   */
  async buscarUmTenant(id: string) {
    try {
      const tableTenants = schema.tenants as any;
      const tablePessoas = schema.pessoas as any;

      // Busca a Imobiliária
      const [tenant] = await this.db
        .select()
        .from(tableTenants)
        .where(eq(tableTenants.id, id))
        .limit(1);
      if (!tenant) return null;

      // Busca o Dono para pegar o endereço e o nome real
      const [dono] = await this.db
        .select()
        .from(tablePessoas)
        .where(and(eq(tablePessoas.tenant_id, id), eq(tablePessoas.papel, '6')))
        .limit(1);

      return {
        ...tenant,
        nomeDono: dono?.nome || '',
        // REUSO INDUSTRIAL: Chama sua função universal
        endereco: dono ? await buscarEnderecoVinculado(this.db, dono.id) : null,
      };
    } catch (e) {
      return null;
    }
  }

  /**
   * 3. MOTOR DE ONBOARDING (Inclusão e Alteração Inteligente)
   */
  async onboarding(dto: any) {
    return await this.db.transaction(async (tx: any) => {
      try {
        const isUpdate = dto.id && dto.id !== 'undefined';
        const tenantId = dto.id;

        const tableTenants = schema.tenants as any;
        const tablePessoas = schema.pessoas as any;
        const tableEnderecos = schema.enderecos as any;
        const tableUnidades = schema.unidades as any;

        const payloadTenant = {
          nome_conta: dto.nome_conta,
          nome_fantasia: dto.nome_fantasia || dto.nome_conta,
          url_logo: dto.url_logo || null,
          slug: dto.slug,
          email_financeiro: dto.email_financeiro,
          telefone: dto.telefone || null,
          status: 'ativo',
          version_schema: '1.0.1',
          updated_at: new Date(),
        };

        if (isUpdate) {
          // ATUALIZAÇÃO
          await tx
            .update(tableTenants)
            .set(payloadTenant)
            .where(eq(tableTenants.id, tenantId));

          await tx
            .update(tablePessoas)
            .set({ nome: dto.nomeDono, email: dto.email_financeiro })
            .where(
              and(
                eq(tablePessoas.tenant_id, tenantId),
                eq(tablePessoas.papel, '6'),
              ),
            );
        } else {
          // INCLUSÃO
          const [tenant] = await tx
            .insert(tableTenants)
            .values(payloadTenant)
            .returning();

          const [unidade] = await tx
            .insert(tableUnidades)
            .values({
              tenant_id: tenant.id,
              nome: 'MATRIZ - CENTRAL',
              is_matriz: true,
            })
            .returning();

          const [pessoa] = await tx
            .insert(tablePessoas)
            .values({
              tenant_id: tenant.id,
              unidade_id: unidade.id,
              nome: dto.nomeDono || dto.nome_fantasia,
              email: dto.email_financeiro,
              documento: dto.documento || '000.000.000-00',
              papel: '6',
              is_admin: true,
              cargo: 'ceo',
            })
            .returning();

          if (dto.endereco) {
            await tx.insert(tableEnderecos).values({
              pessoa_id: pessoa.id,
              ...dto.endereco,
            });
          }
        }
        return { success: true };
      } catch (e: any) {
        throw new InternalServerErrorException(e.message);
      }
    });
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
