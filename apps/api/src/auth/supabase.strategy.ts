// src/auth/supabase.strategy.ts

import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

import { eq, type PostgresJsDatabase } from '@sismob/database';

import * as schema from '@sismob/database';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {
    const supabaseUrl =
      process.env.SISMOB_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('SISMOB_SUPABASE_URL não configurada na API.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      algorithms: ['ES256'],

      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    console.log('======================================');
    console.log('SUPABASE STRATEGY');
    console.log({
      sub: payload?.sub,
      email: payload?.email,
    });
    console.log('======================================');

    if (!payload?.sub) {
      throw new UnauthorizedException('Token sem identificador do usuário.');
    }

    const pessoasTable = schema.pessoas;

    const result = await this.db
      .select()
      .from(pessoasTable)
      .where(eq(pessoasTable.auth_user_id, payload.sub))
      .limit(1);

    const userProfile = result[0];

    if (!userProfile) {
      throw new UnauthorizedException(
        `Perfil não encontrado para o usuário autenticado: ${
          payload.email || payload.sub
        }`,
      );
    }

    return {
      userId: userProfile.id,
      authUserId: payload.sub,
      email: userProfile.email,
      tenantId: userProfile.tenant_id,
      papel: userProfile.papel,
      cargo: userProfile.cargo,
      nome: userProfile.nome,
    };
  }
}
