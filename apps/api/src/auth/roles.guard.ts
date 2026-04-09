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
    const user = request.user; // Injetado pelo SupabaseStrategy (payload do JWT)

    if (!user || !user.userId) return false;

    try {
      // Usamos casting para (this.db.query as any) para habilitar o acesso à tabela pessoas
      const queryApi = this.db.query as any;

      const perfil = await queryApi.pessoas.findFirst({
        where: eq(schema.pessoas.id as any, user.userId),
      });

      if (!perfil) {
        console.error('❌ Perfil não encontrado para o ID:', user.userId);
        return false;
      }

      // Permitir se for papel '1' (Admin/Corretor) OU '5' (Imobiliária)
      // Usar String() garante a comparação correta
      const papel = String(perfil.papel);
      const temAcesso = papel === '1' || papel === '5';

      console.log(
        `🔐 Acesso para ${perfil.nome}: ${temAcesso ? '✅' : '❌'} (Papel: ${papel})`,
      );

      return temAcesso;
    } catch (error) {
      console.error('❌ Erro no RolesGuard:', error.message);
      return false;
    }
  }
}
