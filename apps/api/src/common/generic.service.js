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
exports.GenericService = void 0;
const common_1 = require("@nestjs/common");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@sismob/database"));
const drizzle_orm_1 = require("drizzle-orm");
let GenericService = class GenericService {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * BUSCA INDUSTRIAL: Aceita busca textual E filtros específicos (ex: papel, status)
     */
    async findAll(tableName, tenantId, search, filters) {
        try {
            const table = schema[tableName];
            if (!table)
                throw new Error(`Tabela ${tableName} não mapeada no Schema.`);
            let conds = [(0, drizzle_orm_1.eq)(table.tenant_id, tenantId)];
            // 1. Busca Textual (Nome ou Descrição)
            if (search) {
                const searchConds = [];
                if (table.nome)
                    searchConds.push((0, drizzle_orm_1.ilike)(table.nome, `%${search}%`));
                if (table.descricao)
                    searchConds.push((0, drizzle_orm_1.ilike)(table.descricao, `%${search}%`));
                if (searchConds.length > 0)
                    conds.push((0, drizzle_orm_1.or)(...searchConds));
            }
            // 2. Filtros Dinâmicos (Ex: papel: '3' para proprietários)
            if (filters) {
                Object.keys(filters).forEach((key) => {
                    if (table[key] &&
                        filters[key] !== undefined &&
                        key !== 'imobiliariaId' &&
                        key !== 'search') {
                        conds.push((0, drizzle_orm_1.eq)(table[key], filters[key]));
                    }
                });
            }
            return await this.db
                .select()
                .from(table)
                .where((0, drizzle_orm_1.and)(...conds));
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(`Erro ao listar ${tableName}: ${e.message}`);
        }
    }
    async upsert(tableName, dto, tenantId) {
        try {
            const table = schema[tableName];
            const isUpdate = !!dto.id;
            // Sanitização: Remove o ID do payload de insert e garante o tenant_id
            const { id, ...data } = dto;
            const payload = {
                ...data,
                tenant_id: tenantId,
                updated_at: new Date(), // Auditoria para o RAG
            };
            if (isUpdate) {
                return await this.db
                    .update(table)
                    .set(payload)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(table.id, id), (0, drizzle_orm_1.eq)(table.tenant_id, tenantId)));
            }
            else {
                return await this.db.insert(table).values(payload).returning();
            }
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(`Erro ao salvar ${tableName}: ${e.message}`);
        }
    }
    async remove(tableName, id, tenantId) {
        const table = schema[tableName];
        return await this.db
            .delete(table)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(table.id, id), (0, drizzle_orm_1.eq)(table.tenant_id, tenantId)));
    }
};
exports.GenericService = GenericService;
exports.GenericService = GenericService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_CONNECTION')),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], GenericService);
