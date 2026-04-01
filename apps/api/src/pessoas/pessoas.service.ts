import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class PessoasService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  // 1=usuario/admin, 2=cliente, 3=proprietário, 4=inquilino, 5=imobiliaria, 6=tenant
  async findByRole(
    papel: '1' | '2' | '3' | '4' | '5' | '6',
    imobiliariaId: string,
  ) {
    return await this.db.query.pessoas.findMany({
      where: and(
        eq(schema.pessoas.imobiliariaId, imobiliariaId),
        eq(schema.pessoas.papel, papel),
      ),
    });
  }

  async createUsuario(dto: any, requesterId: string) {
    const requester = await this.db.query.pessoas.findFirst({
      where: eq(schema.pessoas.id, requesterId),
    });

    // Mudamos de 'admin' para '1' (que representa o administrador no seu novo schema)
    if (!requester || requester.papel !== '1') {
      throw new UnauthorizedException(
        'Apenas administradores podem gerenciar usuários.',
      );
    }

    return await this.db.insert(schema.pessoas).values(dto).returning();
  }
}
