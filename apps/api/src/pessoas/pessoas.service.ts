import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // 1. BUSCA POR PAPEL (SaaS): Mantém o que já funciona
  async findByRole(papel: string, imobiliariaId: string) {
    try {
      const results = await this.db
        .select()
        .from(schema.pessoas as any)
        .where(
          and(
            eq((schema.pessoas as any).imobiliariaId, imobiliariaId),
            eq((schema.pessoas as any).papel, papel),
          ),
        );
      return results;
    } catch (error) {
      console.error('❌ Erro no Service findByRole:', error.message);
      return [];
    }
  }

  // 2. IDENTIFICAÇÃO PELO DOMÍNIO (Público): Mantém o que já funciona
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
      console.error('❌ Erro no Service findImobiliariaByHost:', error.message);
      return null;
    }
  }

  // 3. CRIAÇÃO COMPLETA (Pessoa + Endereço): O UPGRADE DO SEU CRM
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await this.db.transaction(async (tx) => {
        // A. Salva os dados básicos da pessoa
        const [novaPessoa] = await (tx.insert(schema.pessoas as any) as any)
          .values({
            nome: dto.nome,
            email: dto.email,
            documento: dto.documento,
            telefone: dto.telefone,
            tipo: dto.tipo || 'f',
            papel: dto.papel || '2', // Default para Cliente caso não venha
            imobiliariaId: imobiliariaId,
          })
          .returning();

        // B. Salva o endereço se o CEP foi preenchido no formulário
        if (dto.cep) {
          await (tx.insert(schema.enderecos as any) as any).values({
            pessoaId: novaPessoa.id,
            cep: dto.cep,
            logradouro: dto.logradouro,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            estado: dto.estado,
            tipoEndereco: 'principal',
          });
        }

        return novaPessoa;
      });
    } catch (error) {
      console.error('❌ Erro ao criar usuário completo:', error.message);
      throw new InternalServerErrorException(
        'Erro ao salvar usuário e endereço.',
      );
    }
  }
}
