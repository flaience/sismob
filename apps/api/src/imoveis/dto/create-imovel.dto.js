"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateImovelDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class InstrucaoChegadaDto {
    ordem;
    titulo;
    descricao;
    fotoUrl;
    latAlvo;
    lngAlvo;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InstrucaoChegadaDto.prototype, "ordem", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstrucaoChegadaDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstrucaoChegadaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], InstrucaoChegadaDto.prototype, "fotoUrl", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InstrucaoChegadaDto.prototype, "latAlvo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InstrucaoChegadaDto.prototype, "lngAlvo", void 0);
class InfraestruturaDto {
    temAguaQuente;
    temEsperaSplit;
    temChurrasqueira;
    mobiliado;
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InfraestruturaDto.prototype, "temAguaQuente", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InfraestruturaDto.prototype, "temEsperaSplit", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InfraestruturaDto.prototype, "temChurrasqueira", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], InfraestruturaDto.prototype, "mobiliado", void 0);
class CreateImovelDto {
    titulo;
    descricao;
    tipo;
    precoVenda;
    areaPrivativa;
    // Localização
    endereco;
    lat;
    lng;
    tourVirtualUrl;
    // Dados Relacionados
    infra;
    instrucoes;
}
exports.CreateImovelDto = CreateImovelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImovelDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImovelDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['casa', 'apartamento', 'terreno', 'comercial']),
    __metadata("design:type", String)
], CreateImovelDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateImovelDto.prototype, "precoVenda", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateImovelDto.prototype, "areaPrivativa", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateImovelDto.prototype, "endereco", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateImovelDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateImovelDto.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateImovelDto.prototype, "tourVirtualUrl", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InfraestruturaDto),
    __metadata("design:type", InfraestruturaDto)
], CreateImovelDto.prototype, "infra", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InstrucaoChegadaDto),
    __metadata("design:type", Array)
], CreateImovelDto.prototype, "instrucoes", void 0);
