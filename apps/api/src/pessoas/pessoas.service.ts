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

  // Busca por papel e imobiliária (SaaS)
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

  // Identificação pelo domínio (Público)
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

  // Criação de usuários
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await (this.db.insert(schema.pessoas as any) as any)
        .values({
          ...dto,
          imobiliariaId,
        })
        .returning();
    } catch (error) {
      throw new InternalServerErrorException('Erro ao salvar usuário.');
    }
  }
}
