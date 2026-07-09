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
    console.log('======================================');
    console.log('SUPABASE STRATEGY');
    console.log('Payload recebido:');
    console.log(payload);
    console.log('======================================');
    const pessoasTable = (schema as any).pessoas;

    let result = await this.db
      .select()
      .from(pessoasTable)
      .where(eq(pessoasTable.id, payload.sub))
      .limit(1);

    let userProfile = result[0];

    if (!userProfile && payload.email) {
      result = await this.db
        .select()
        .from(pessoasTable)
        .where(eq(pessoasTable.email, payload.email))
        .limit(1);

      userProfile = result[0];
    }

    if (!userProfile) {
      throw new UnauthorizedException(
        `Perfil não encontrado para o usuário autenticado: ${payload.email || payload.sub}`,
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
