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
exports.FilesService = void 0;
/// <reference types="multer" />
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const file_utils_1 = require("./../common/utils/file-utils"); // Agora o caminho está correto
let FilesService = class FilesService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async uploadFoto(file, path) {
        const nomeLimpo = (0, file_utils_1.sanitizeFileName)(file.originalname);
        const fileName = `${Date.now()}-${nomeLimpo}`;
        const filePath = `${path}/${fileName}`;
        const { error } = await this.supabase.storage
            .from('sismob-media')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            throw new common_1.BadRequestException(`Erro no Storage: ${error.message}`);
        }
        const { data } = this.supabase.storage
            .from('sismob-media')
            .getPublicUrl(filePath);
        return data.publicUrl;
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FilesService);
