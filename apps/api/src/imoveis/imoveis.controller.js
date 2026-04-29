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
exports.ImoveisController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const imoveis_service_1 = require("./imoveis.service");
let ImoveisController = class ImoveisController {
    imoveisService;
    constructor(imoveisService) {
        this.imoveisService = imoveisService;
    }
    async findAll(tenantId) {
        return this.imoveisService.findAll(tenantId);
    }
    async findOne(id, tenantId) {
        return this.imoveisService.findOne(+id, tenantId);
    }
    async save(data, files) {
        // Pegamos o tenantId (imobiliária) enviado pelo form
        return this.imoveisService.upsert(data, files, data.imobiliariaId);
    }
};
exports.ImoveisController = ImoveisController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('imobiliariaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImoveisController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('imobiliariaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImoveisController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'galeria', maxCount: 20 },
        { name: 'foto360', maxCount: 10 },
    ])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImoveisController.prototype, "save", null);
exports.ImoveisController = ImoveisController = __decorate([
    (0, common_1.Controller)('imoveis'),
    __param(0, (0, common_1.Inject)(imoveis_service_1.ImoveisService)),
    __metadata("design:paramtypes", [imoveis_service_1.ImoveisService])
], ImoveisController);
