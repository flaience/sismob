import {
  Injectable,
  Inject,
  UnauthorizedException,
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
    const queryApi = this.db.query as any;
    return await queryApi.pessoas.findMany({
      where: and(
        eq(schema.pessoas.imobiliariaId as any, imobiliariaId),
        eq(schema.pessoas.papel as any, papel),
      ),
    });
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
      // Usamos a Query API com casting para evitar qualquer erro de tipo
      const queryApi = this.db.query as any;

      const result = await queryApi.pessoas.findFirst({
        where: and(
          eq(schema.pessoas.dominio as any, host),
          eq(schema.pessoas.papel as any, '5'), // 5 = Imobiliária
        ),
      });

      return result;
    } catch (error) {
      console.error('❌ Erro na Identificação por Host:', error.message);
      throw new InternalServerErrorException(
        'Erro interno ao identificar imobiliária.',
      );
    }
  }
}
