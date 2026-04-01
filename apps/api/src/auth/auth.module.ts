import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseStrategy } from './supabase.strategy';

@Module({
  // Importamos o PassportModule configurado
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, SupabaseStrategy],
  // EXPORTAMOS para que outros módulos (como o PessoasModule) usem
  exports: [AuthService, SupabaseStrategy, PassportModule],
})
export class AuthModule {}
