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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracoesController = void 0;
const common_1 = require("@nestjs/common");
const generic_config_service_1 = require("./generic-config.service");
let ConfiguracoesController = class ConfiguracoesController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    // Mapeamento: O que vem na URL -> Nome da tabela no Schema.ts
    getTableName(slug) {
        const map = {
            bancos: 'bancos',
            unidades: 'unidades',
            'grupos-caixa': 'grupoCaixa',
            atributos: 'categoriasAtributos',
        };
        return map[slug];
    }
    async list(slug, tenantId, search) {
        return this.configService.findAll(this.getTableName(slug), tenantId, search);
    }
    async save(slug, dto) {
        return this.configService.upsert(this.getTableName(slug), dto, dto.imobiliariaId);
    }
    async remove(slug, id, tenantId) {
        return this.configService.remove(this.getTableName(slug), +id, tenantId);
    }
};
exports.ConfiguracoesController = ConfiguracoesController;
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('imobiliariaId')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfiguracoesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfiguracoesController.prototype, "save", null);
__decorate([
    (0, common_1.Delete)(':slug/:id'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('imobiliariaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfiguracoesController.prototype, "remove", null);
exports.ConfiguracoesController = ConfiguracoesController = __decorate([
    (0, common_1.Controller)('configuracoes'),
    __metadata("design:paramtypes", [generic_config_service_1.GenericConfigService])
], ConfiguracoesController);
