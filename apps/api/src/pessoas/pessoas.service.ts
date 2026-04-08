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

  // 1. Método para busca por papel (1=Admin, 2=Cliente, etc)
  async findByRole(papel: string, imobiliariaId: string) {
    try {
      // Usamos a forma mais básica do Drizzle para não ter erro de tradução
      const query = this.db
        .select()
        .from(schema.pessoas as any)
        .where(
          and(
            eq((schema.pessoas as any).imobiliariaId, imobiliariaId),
            eq((schema.pessoas as any).papel, papel),
          ),
        );

      return await query;
    } catch (error) {
      console.error('❌ Erro no SQL do Service:', error.message);
      return [];
    }
  }

  // 2. Método exigido pelo Controller para criar usuários/corretores
  async createUsuario(dto: any, imobiliariaId: string) {
    try {
      return await (this.db.insert(schema.pessoas as any) as any)
        .values({
          ...dto,
          imobiliariaId,
          papel: dto.papel || '1', // Default para usuário
        })
        .returning();
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw new InternalServerErrorException(
        'Erro ao salvar usuário no banco.',
      );
    }
  }

  // 3. Método para o sistema identificar a imobiliária pelo domínio
  async findImobiliariaByHost(host: string) {
    try {
      // O 'as any' no schema.pessoas resolve o erro de 'not assignable'
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
      console.error('❌ Erro na busca por domínio:', error.message);
      throw new InternalServerErrorException(
        'Falha ao identificar imobiliária.',
      );
    }
  }
}
