import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class InstrucaoChegadaDto {
  @IsNumber() ordem: number;
  @IsString() titulo: string;
  @IsString() descricao: string;
  @IsOptional() @IsUrl() fotoUrl?: string;
  @IsNumber() latAlvo: number;
  @IsNumber() lngAlvo: number;
}

class InfraestruturaDto {
  @IsBoolean() temAguaQuente: boolean;
  @IsBoolean() temEsperaSplit: boolean;
  @IsBoolean() temChurrasqueira: boolean;
  @IsBoolean() mobiliado: boolean;
}

export class CreateImovelDto {
  @IsString() titulo: string;
  @IsString() descricao: string;
  @IsEnum(['casa', 'apartamento', 'terreno', 'comercial']) tipo:
    | 'casa'
    | 'apartamento'
    | 'terreno'
    | 'comercial';

  @IsNumber() precoVenda: number;
  @IsNumber() areaPrivativa: number;

  // Localização
  @IsString() endereco: string;
  @IsNumber() lat: number;
  @IsNumber() lng: number;

  @IsOptional() @IsUrl() tourVirtualUrl?: string;

  // Dados Relacionados
  @ValidateNested() @Type(() => InfraestruturaDto) infra: InfraestruturaDto;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstrucaoChegadaDto)
  instrucoes: InstrucaoChegadaDto[];
}
