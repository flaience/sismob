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
exports.PessoasController = void 0;
const common_1 = require("@nestjs/common");
const pessoas_service_1 = require("./pessoas.service");
let PessoasController = class PessoasController {
    pessoasService;
    constructor(pessoasService) {
        this.pessoasService = pessoasService;
    }
    // Rota de Identificação
    async identificar(host) {
        return this.pessoasService.findImobiliariaByHost(host);
    }
    // Listagem do Grid
    async findAll(papel, imobId, search) {
        return this.pessoasService.findByRole(papel, imobId, search);
    }
    // Busca por ID
    async findOne(id, tid) {
        return this.pessoasService.findOne(id, tid);
    }
    // Salvar (POST e PATCH chamam o save com 2 argumentos)
    async create(dto) {
        return this.pessoasService.save(dto, dto.imobiliariaId);
    }
    async update(id, dto) {
        return this.pessoasService.save({ ...dto, id }, dto.imobiliariaId);
    }
    // Remover
    async remove(id, imobId) {
        return this.pessoasService.remove(id, imobId);
    }
};
exports.PessoasController = PessoasController;
__decorate([
    (0, common_1.Get)('config/identificar'),
    __param(0, (0, common_1.Query)('host')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "identificar", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('papel')),
    __param(1, (0, common_1.Query)('imobiliariaId')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('imobiliariaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('imobiliariaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "remove", null);
exports.PessoasController = PessoasController = __decorate([
    (0, common_1.Controller)('pessoas'),
    __metadata("design:paramtypes", [pessoas_service_1.PessoasService])
], PessoasController);
