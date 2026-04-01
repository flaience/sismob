import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-tenant')
  async register(@Body() dto: RegisterTenantDto) {
    return this.authService.registerTenant(dto);
  }
}
