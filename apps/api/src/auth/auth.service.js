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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@sismob/database"));
const supabase_js_1 = require("@supabase/supabase-js");
let AuthService = class AuthService {
    db;
    supabaseAdmin;
    constructor(db) {
        this.db = db;
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (url && key) {
            this.supabaseAdmin = (0, supabase_js_1.createClient)(url, key);
        }
    }
    // apps/api/src/auth/auth.service.ts
    async registerTenant(dto) {
        return await this.db.transaction(async (tx) => {
            // 1. Criar o registro mestre na tabela TENANTS
            const [tenant] = await tx.insert(schema.tenants)
                .values({
                nome_conta: dto.nomeImobiliaria,
                slug: dto.slug || dto.nomeImobiliaria.toLowerCase().replace(/ /g, '-'),
                email_financeiro: dto.emailFinanceiro,
                status: 'trial',
            })
                .returning();
            // 2. Criar a Unidade MATRIZ
            const [unidade] = await tx.insert(schema.unidades)
                .values({
                tenant_id: tenant.id,
                nome: 'Matriz',
                is_matriz: true,
            })
                .returning();
            // 3. Criar o Usuário no Supabase Auth
            const { data: authUser } = await this.supabaseAdmin.auth.admin.createUser({
                email: dto.emailAdmin,
                password: dto.senha,
                email_confirm: true,
            });
            // 4. Criar o Perfil da Pessoa (Admin do Tenant)
            await tx.insert(schema.pessoas).values({
                id: authUser.user.id,
                tenant_id: tenant.id,
                unidade_id: unidade.id,
                nome: dto.nomeAdmin,
                email: dto.emailAdmin,
                papel: '1', // Admin/Corretor
                is_admin: true,
            });
            return {
                tenantId: tenant.id,
                message: 'Contrato ativado manualmente com sucesso!',
            };
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_CONNECTION')),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], AuthService);
