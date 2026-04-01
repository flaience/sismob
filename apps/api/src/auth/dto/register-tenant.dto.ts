import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterTenantDto {
  // Dados da Imobiliária
  @IsString() nomeImobiliaria: string;

  // Dados do Primeiro Admin
  @IsString() nomeAdmin: string;
  @IsEmail() emailAdmin: string;
  @MinLength(6) senhaAdmin: string;
}
