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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratosService = void 0;
//src/contratos/contratos.service.ts
const common_1 = require("@nestjs/common");
const postgres_js_1 = require("drizzle-orm/postgres-js");
const schema = __importStar(require("@sismob/database"));
const drizzle_orm_1 = require("drizzle-orm");
const axios_1 = __importDefault(require("axios"));
let ContratosService = class ContratosService {
    db;
    constructor(db) {
        this.db = db;
    }
    /**
     * GERAÇÃO DE CONTRATO INTELIGENTE
     * @param templateId ID do modelo (Compra/Venda, Locação, etc)
     * @param dados Objeto com valores para substituir {{NOME}}, {{VALOR}}, etc
     */
    async gerarContrato(templateId, dados) {
        try {
            // 1. ACESSO INDUSTRIAL: Usamos o casting no objeto schema inteiro
            // Isso ignora o erro de "Property does not exist" durante o build
            const dbSchema = schema;
            const tableTemplates = dbSchema.templatesContratos;
            if (!tableTemplates) {
                throw new Error('Tabela templatesContratos não encontrada no Schema.');
            }
            const results = await this.db
                .select()
                .from(tableTemplates)
                .where((0, drizzle_orm_1.eq)(tableTemplates.id, templateId))
                .limit(1);
            const template = results[0];
            if (!template) {
                throw new common_1.NotFoundException('Modelo de contrato não encontrado.');
            }
            // 2. Mágica da Substituição: Transforma {{CHAVE}} no valor real
            let textoFinal = template.conteudo;
            // Percorre todas as chaves enviadas (ex: NOME_PROPRIETARIO, VALOR_IMOVEL)
            Object.keys(dados).forEach((chave) => {
                const regex = new RegExp(`{{${chave}}}`, 'g');
                textoFinal = textoFinal.replace(regex, String(dados[chave] || '__________'));
            });
            // 3. Integração com n8n (O Motor de PDF)
            const n8nUrl = process.env.N8N_PDF_WORKFLOW;
            if (!n8nUrl) {
                console.warn('⚠️ Link do n8n não configurado. Retornando HTML puro.');
                return {
                    html: textoFinal,
                    status: 'rascunho',
                };
            }
            // Envia o texto processado para o n8n gerar o PDF profissional
            const res = await axios_1.default.post(n8nUrl, {
                texto: textoFinal,
                filename: `contrato_sismob_${Date.now()}.pdf`,
            });
            return {
                linkPdf: res.data.url, // O n8n deve devolver a URL do arquivo no Supabase
                status: 'pronto_para_assinatura',
            };
        }
        catch (error) {
            console.error('❌ Erro no Motor de Contratos:', error.message);
            throw new common_1.InternalServerErrorException(`Falha ao gerar documento: ${error.message}`);
        }
    }
};
exports.ContratosService = ContratosService;
exports.ContratosService = ContratosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DRIZZLE_CONNECTION')),
    __metadata("design:paramtypes", [postgres_js_1.PostgresJsDatabase])
], ContratosService);
