"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImoveisModule = void 0;
const common_1 = require("@nestjs/common");
const imoveis_controller_1 = require("./imoveis.controller");
const imoveis_service_1 = require("./imoveis.service");
const files_module_1 = require("../files/files.module");
let ImoveisModule = class ImoveisModule {
};
exports.ImoveisModule = ImoveisModule;
exports.ImoveisModule = ImoveisModule = __decorate([
    (0, common_1.Module)({
        imports: [files_module_1.FilesModule],
        controllers: [imoveis_controller_1.ImoveisController],
        providers: [imoveis_service_1.ImoveisService], // <--- O NestJS vai ler isso aqui
        exports: [imoveis_service_1.ImoveisService],
    })
], ImoveisModule);
