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
exports.SaasService = void 0;
const common_1 = require("@nestjs/common");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@sismob/database"));
const drizzle_orm_1 = require("drizzle-orm");
let SaasService = class SaasService {
    db;
    constructor(db) {
        this.db = db;
    }
    // 1. LISTAR TODAS AS IMOBILIÁRIAS (Cockpit Luis)
    async listarTenants() {
        try {
            return await this.db.select().from(schema.tenants);
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(`Erro ao listar tenants: ${e.message}`);
        }
    }
    // 2. ONBOARDING INDUSTRIAL (Cria Empresa + Matriz + Admin)
    // 2. ONBOARDING INDUSTRIAL (Cria Empresa + Matriz + Admin)
    async onboarding(dto) {
        return await this.db.transaction(async (tx) => {
            try {
                console.log(`🚀 Iniciando Onboarding para: ${dto.nomeEmpresa}`);
                // A. Criar a Empresa (Tenant) - Ajustado para v5.1
                const [tenant] = await tx
                    .insert(schema.tenants)
                    .values({
                    nome_conta: dto.nomeEmpresa,
                    slug: dto.slug,
                    dominio_customizado: dto.dominio || null,
                    email_financeiro: dto.emailFinanceiro || dto.email, // <--- OBRIGATÓRIO
                    version_schema: '1.0.1', // <--- OBRIGATÓRIO PARA IA/RAG
                    status: 'ativo',
                })
                    .returning();
                // B. Criar a Unidade Matriz automaticamente (Padrão Sismob)
                const [unidade] = await tx
                    .insert(schema.unidades)
                    .values({
                    tenant_id: tenant.id,
                    nome: 'MATRIZ - CENTRAL',
                    is_matriz: true,
                })
                    .returning();
                // C. Criar o Usuário Admin da Imobiliária (Papel 6)
                await tx.insert(schema.pessoas).values({
                    id: (0, drizzle_orm_1.sql) `gen_random_uuid()`, // Garante um novo ID se não vier no DTO
                    tenant_id: tenant.id,
                    unidade_id: unidade.id,
                    nome: dto.nomeResponsavel,
                    email: dto.email,
                    documento: dto.documento,
                    papel: '6', // Dono da Imobiliária
                    is_admin: true,
                    cargo: 'gerente_geral',
                });
                console.log(`✅ Onboarding concluído com sucesso: ${tenant.slug}`);
                return { success: true, tenantId: tenant.id, slug: tenant.slug };
            }
            catch (e) {
                console.error('❌ Erro Crítico no Onboarding:', e.message);
                // O transaction fará o rollback automático aqui
                throw new common_1.InternalServerErrorException(`Falha no processo de Onboarding: ${e.message}`);
            }
        });
    }
    // 3. FINANCEIRO FLAIENCE: Ver faturamento consolidado
    async getFinanceiroFlaience() {
        try {
            const tenantsTable = schema.tenants;
            const stats = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(tenantsTable)
                .where((0, drizzle_orm_1.eq)(tenantsTable.status, 'ativo'));
            return {
                imobiliariasAtivas: Number(stats[0].count),
                faturamentoEstimado: Number(stats[0].count) * 299, // Exemplo de valor
            };
        }
        catch (e) {
            return { imobiliariasAtivas: 0, faturamentoEstimado: 0 };
        }
    }
};
exports.SaasService = SaasService;
exports.SaasService = SaasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_CONNECTION')),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], SaasService);
