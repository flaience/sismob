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
exports.PessoasService = void 0;
const common_1 = require("@nestjs/common");
const schema = __importStar(require("@sismob/database"));
const drizzle_orm_1 = require("drizzle-orm");
let PessoasService = class PessoasService {
    db;
    // 1. Usamos 'any' no banco para evitar conflito de versão do Drizzle entre pacotes
    constructor(db) {
        this.db = db;
    }
    // 2. Busca por ID Único (Resolvendo erro do Controller)
    async findOne(id, imobId) {
        const table = schema.pessoas;
        const results = await this.db
            .select()
            .from(table)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(table.id, id), (0, drizzle_orm_1.eq)(table.tenant_id, imobId)))
            .limit(1);
        return results[0] || null;
    }
    // 3. Salvar (Inclusão e Alteração) - RECEBE 2 ARGUMENTOS
    async save(dto, tenantId) {
        const table = schema.pessoas;
        const { id, ...data } = dto;
        const payload = { ...data, tenant_id: tenantId, updated_at: new Date() };
        if (id && id !== 'undefined') {
            return await this.db.update(table).set(payload).where((0, drizzle_orm_1.eq)(table.id, id));
        }
        else {
            return await this.db.insert(table).values(payload).returning();
        }
    }
    // 4. Identificação por Host
    async findImobiliariaByHost(host) {
        const table = schema.tenants;
        const results = await this.db
            .select()
            .from(table)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(table.dominio_customizado, host), (0, drizzle_orm_1.eq)(table.slug, host.split('.')[0])))
            .limit(1);
        return results[0] || null;
    }
    // 5. Busca por Papel
    async findByRole(papel, imobId, search) {
        const table = schema.pessoas;
        let conds = [(0, drizzle_orm_1.eq)(table.papel, papel), (0, drizzle_orm_1.eq)(table.tenant_id, imobId)];
        if (search)
            conds.push((0, drizzle_orm_1.ilike)(table.nome, `%${search}%`));
        return await this.db
            .select()
            .from(table)
            .where((0, drizzle_orm_1.and)(...conds));
    }
    // 6. Remover
    async remove(id, imobId) {
        const table = schema.pessoas;
        return await this.db
            .delete(table)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(table.id, id), (0, drizzle_orm_1.eq)(table.tenant_id, imobId)));
    }
};
exports.PessoasService = PessoasService;
exports.PessoasService = PessoasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_CONNECTION')),
    __metadata("design:paramtypes", [Object])
], PessoasService);
