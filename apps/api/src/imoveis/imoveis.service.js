"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImoveisService = void 0;
const common_1 = require("@nestjs/common");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@sismob/database"));
const drizzle_orm_1 = require("drizzle-orm");
const files_service_1 = require("../files/files.service");
let ImoveisService = class ImoveisService {
    db;
    filesService;
    constructor(db, filesService) {
        this.db = db;
        this.filesService = filesService;
    }
    // 1. LISTAGEM COMPLETA
    async findAll(tenantId) {
        try {
            const queryApi = this.db.query;
            return await queryApi.imoveis.findMany({
                where: (0, drizzle_orm_1.eq)(schema.imoveis.tenant_id, tenantId),
                with: {
                    midias: true,
                    instrucoesChegada: true,
                    atributos: { with: { atributo: true } },
                },
                orderBy: [(0, drizzle_orm_1.desc)(schema.imoveis.id)],
            });
        }
        catch (e) {
            console.error('❌ Erro no findAll Imoveis:', e.message);
            return [];
        }
    }
    // 2. BUSCA UM ÚNICO
    async findOne(id, tenantId) {
        const queryApi = this.db.query;
        const result = await queryApi.imoveis.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.imoveis.id, id), (0, drizzle_orm_1.eq)(schema.imoveis.tenant_id, tenantId)),
            with: { midias: true, instrucoesChegada: true, atributos: true },
        });
        if (!result)
            throw new common_1.NotFoundException('Imóvel não encontrado.');
        return result;
    }
    async buscarPortal(filtros) {
        const table = schema.imoveis;
        let conds = [(0, drizzle_orm_1.eq)(table.status, 'disponivel')];
        if (filtros.tipo)
            conds.push((0, drizzle_orm_1.eq)(table.tipo, filtros.tipo));
        if (filtros.finalidade)
            conds.push((0, drizzle_orm_1.eq)(table.finalidade, filtros.finalidade));
        if (filtros.quartos)
            conds.push((0, drizzle_orm_1.gte)(table.quartos, Number(filtros.quartos)));
        if (filtros.banheiros)
            conds.push((0, drizzle_orm_1.gte)(table.banheiros, Number(filtros.banheiros)));
        // Filtro de Preço (Intervalo)
        if (filtros.precoMin)
            conds.push((0, drizzle_orm_1.gte)(table.preco_venda, filtros.precoMin));
        if (filtros.precoMax)
            conds.push((0, drizzle_orm_1.lte)(table.preco_venda, filtros.precoMax));
        return await this.db
            .select()
            .from(table)
            .where((0, drizzle_orm_1.and)(...conds));
    }
    // 3. O "UPSERT" (GRAVAÇÃO E ALTERAÇÃO)
    async upsert(dto, files, tenantId) {
        try {
            return await this.db.transaction(async (tx) => {
                const isUpdate = !!dto.id && dto.id !== 'undefined';
                let idImovel = isUpdate ? Number(dto.id) : null;
                const dadosImovel = {
                    tenant_id: tenantId,
                    titulo: dto.titulo,
                    descricao: dto.descricao || '',
                    tipo: dto.tipo || 'casa',
                    status: dto.status || 'disponivel',
                    preco_venda: dto.preco_venda?.toString() || '0',
                    area_privativa: dto.area_privativa?.toString() || '0',
                    endereco_original: dto.endereco_original || 'Não informado',
                    video_url: dto.video_url || null,
                    proprietario_id: dto.proprietario_id,
                };
                // A. GRAVA OU ATUALIZA O MASTER
                if (isUpdate) {
                    await tx
                        .update(schema.imoveis)
                        .set(dadosImovel)
                        .where((0, drizzle_orm_1.eq)(schema.imoveis.id, idImovel));
                }
                else {
                    const [novo] = await tx.insert(schema.imoveis)
                        .values(dadosImovel)
                        .returning();
                    idImovel = novo.id;
                }
                // B. ATRIBUTOS (DELETE & INSERT)
                if (dto.atributosIds) {
                    const ids = Array.isArray(dto.atributosIds)
                        ? dto.atributosIds
                        : [dto.atributosIds];
                    await tx
                        .delete(schema.imoveisAtributos)
                        .where((0, drizzle_orm_1.eq)(schema.imoveisAtributos.imovel_id, idImovel));
                    const novosAtributos = ids.map((atId) => ({
                        imovel_id: idImovel,
                        atributo_id: Number(atId),
                    }));
                    await tx.insert(schema.imoveisAtributos).values(novosAtributos);
                }
                // C. MÍDIAS (UPLOAD E GRAVAÇÃO)
                const allFiles = [...(files?.galeria || []), ...(files?.foto360 || [])];
                for (const file of allFiles) {
                    const url = await this.filesService.uploadFoto(file, `imoveis/${idImovel}`);
                    await tx.insert(schema.midias).values({
                        imovel_id: idImovel,
                        url,
                        tipo: file.fieldname === 'foto360' ? 'foto_360' : 'foto',
                        is_capa: file.originalname === dto.capaNome,
                    });
                }
                return { id: idImovel, success: true };
            });
        }
        catch (e) {
            console.error('❌ Erro fatal no Upsert Imóvel:', e.message);
            throw new common_1.InternalServerErrorException(e.message);
        }
    }
    // 4. REMOÇÃO
    async remove(id, tenantId) {
        try {
            await this.db
                .delete(schema.imoveis)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.imoveis.id, id), (0, drizzle_orm_1.eq)(schema.imoveis.tenant_id, tenantId)));
            return { success: true };
        }
        catch (e) {
            throw new common_1.InternalServerErrorException('Erro ao remover imóvel.');
        }
    }
};
exports.ImoveisService = ImoveisService;
exports.ImoveisService = ImoveisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_CONNECTION')),
    __param(1, (0, common_1.Inject)(files_service_1.FilesService)),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase,
        files_service_1.FilesService])
], ImoveisService);
