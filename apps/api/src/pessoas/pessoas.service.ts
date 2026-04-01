import {
  Injectable,
  UnauthorizedException,
  Inject,
  NotFoundException,
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

  // Criar pessoa vinculada a uma imobiliária
  async create(dto: any, imobiliariaId: string) {
    return await this.db
      .insert(schema.pessoas)
      .values({
        ...dto,
        imobiliariaId,
      })
      .returning();
  }

  // Buscar pessoas filtrando por imobiliária e tipo (papel)
  async findByRole(
    papel: 'corretor' | 'proprietario' | 'cliente',
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
    // 1. Busca quem está fazendo a requisição
    const requester = await this.db.query.pessoas.findFirst({
      where: eq(schema.pessoas.id, requesterId),
    });

    // 2. Trava de segurança: Se não for admin, bloqueia
    if (!requester || requester.papel !== 'admin') {
      throw new UnauthorizedException(
        'Acesso negado: Apenas administradores podem gerenciar usuários.',
      );
    }

    // 3. Procede com a criação
    return await this.db.insert(schema.pessoas).values(dto).returning();
  }
  async getMe(userId: string) {
    const user = await this.db.query.pessoas.findFirst({
      where: eq(schema.pessoas.id, userId),
    });
    if (!user) throw new NotFoundException('Usuário não encontrado no Sismob.');
    return user;
  }
}
