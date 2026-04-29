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
exports.GenericController = void 0;
const common_1 = require("@nestjs/common");
const generic_service_1 = require("./generic.service");
let GenericController = class GenericController {
    generic;
    constructor(generic) {
        this.generic = generic;
    }
    async list(table, tid, s, filters) {
        return this.generic.findAll(table, tid, s, filters);
    }
    async save(table, dto) {
        // imobiliariaId vem do TenantContext no Frontend
        return this.generic.upsert(table, dto, dto.imobiliariaId);
    }
    async remove(table, id, tid) {
        return this.generic.remove(table, Number(id), tid);
    }
};
exports.GenericController = GenericController;
__decorate([
    (0, common_1.Get)(':table'),
    __param(0, (0, common_1.Param)('table')),
    __param(1, (0, common_1.Query)('imobiliariaId')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], GenericController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':table'),
    __param(0, (0, common_1.Param)('table')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GenericController.prototype, "save", null);
__decorate([
    (0, common_1.Delete)(':table/:id'),
    __param(0, (0, common_1.Param)('table')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('imobiliariaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GenericController.prototype, "remove", null);
exports.GenericController = GenericController = __decorate([
    (0, common_1.Controller)('factory'),
    __metadata("design:paramtypes", [generic_service_1.GenericService])
], GenericController);
