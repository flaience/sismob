import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@sismob/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private db: PostgresJsDatabase<typeof schema>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // payload.sub é o UUID do usuário que logou
    const queryApi = this.db.query as any;

    const userProfile = await queryApi.pessoas.findFirst({
      where: eq(schema.pessoas.id as any, payload.sub),
    });

    if (!userProfile) {
      throw new UnauthorizedException(
        'Perfil não encontrado no banco de dados.',
      );
    }

    // RETORNAMOS O OBJETO QUE SERÁ USADO EM 'req.user'
    return {
      userId: userProfile.id,
      email: userProfile.email,
      imobiliariaId: userProfile.imobiliariaId, // <--- ESTA É A VARIÁVEL QUE FALTAVA
      papel: userProfile.papel,
    };
  }
}
