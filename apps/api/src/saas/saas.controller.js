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
exports.SaasController = void 0;
const common_1 = require("@nestjs/common");
const saas_service_1 = require("./saas.service");
let SaasController = class SaasController {
    saasService;
    constructor(saasService) {
        this.saasService = saasService;
    }
    async getDash() {
        return this.saasService.getFinanceiroFlaience();
    }
    async listTenants() {
        return this.saasService.listarTenants();
    }
    async createTenant(dto) {
        return this.saasService.onboarding(dto);
    }
};
exports.SaasController = SaasController;
__decorate([
    (0, common_1.Get)('dash'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "getDash", null);
__decorate([
    (0, common_1.Get)('tenants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "listTenants", null);
__decorate([
    (0, common_1.Post)('onboarding'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SaasController.prototype, "createTenant", null);
exports.SaasController = SaasController = __decorate([
    (0, common_1.Controller)('saas'),
    __metadata("design:paramtypes", [saas_service_1.SaasService])
], SaasController);
