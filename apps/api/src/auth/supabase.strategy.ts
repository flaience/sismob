// apps/api/src/auth/supabase.strategy.ts
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
    const pessoasTable = (schema as any).pessoas;

    const result = await this.db
      .select()
      .from(pessoasTable)
      .where(eq(pessoasTable.id, payload.sub))
      .limit(1);

    const userProfile = result[0];

    if (!userProfile) {
      throw new UnauthorizedException(
        'Perfil não encontrado no banco de dados.',
      );
    }

    return {
      userId: userProfile.id,
      email: userProfile.email,
      tenantId: userProfile.tenant_id,
      papel: userProfile.papel,
      cargo: userProfile.cargo,
      nome: userProfile.nome,
    };
  }
}
