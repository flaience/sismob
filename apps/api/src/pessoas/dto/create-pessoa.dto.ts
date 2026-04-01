import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export class CreatePessoaDto {
  @IsString() nome: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() documento?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsEnum(['fisica', 'juridica']) tipo: 'fisica' | 'juridica';
  @IsOptional() @IsBoolean() isCorretor?: boolean;
}
