import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // O usuário vem do SupabaseStrategy

    if (!user || !user.userId) return false;

    // BUSCA NA TABELA ÚNICA 'pessoas' (Antiga 'perfis')
    const perfil = await this.db.query.pessoas.findFirst({
      where: eq(schema.pessoas.id, user.userId),
    });

    // Permitir acesso se for Papel '1' (Usuário/Admin) ou '5' (Imobiliária)
    const temAcesso = perfil?.papel === '1' || perfil?.papel === '5';

    return temAcesso;
  }
}
