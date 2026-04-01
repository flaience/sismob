import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // Extrai o token do cabeçalho 'Authorization: Bearer <TOKEN>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // A chave secreta que o Supabase usa para assinar os tokens
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // O payload é o conteúdo do token JWT do Supabase decodificado
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
