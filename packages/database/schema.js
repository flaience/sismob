"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagamentosRelations = exports.titulosRelations = exports.negociacoesRelations = exports.atributosRelations = exports.imoveisAtributosRelations = exports.imoveisRelations = exports.logsAtividades = exports.aiConversas = exports.baseConhecimento = exports.movNegociacao = exports.negociacoes = exports.caixa = exports.pagamentos = exports.titulos = exports.bancos = exports.contasBancarias = exports.grupoCaixa = exports.imoveisAtributos = exports.atributos = exports.categoriasAtributos = exports.instrucoesChegada = exports.midias = exports.imoveis = exports.enderecos = exports.pessoas = exports.unidades = exports.tenants = exports.tipoMov = exports.tipoMidiaEnum = exports.statusNegociacao = exports.situacaoTitulo = exports.tipoMovimentoFinanceiro = exports.papelPessoa = exports.statusSaaS = exports.tipoFisicaJuridica = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// ==========================================
// 1. ENUMS (PADRONIZAÇÃO GLOBAL)
// ==========================================
exports.tipoFisicaJuridica = (0, pg_core_1.pgEnum)("tipo_entidade", ["f", "j"]);
exports.statusSaaS = (0, pg_core_1.pgEnum)("status_saas", [
    "trial",
    "ativo",
    "inadimplente",
    "suspenso",
]);
exports.papelPessoa = (0, pg_core_1.pgEnum)("papel_pessoa", [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
]);
// 1=Corretor/Admin, 2=Interessado/Lead, 3=Proprietário, 4=Inquilino, 5=Unidade, 6=Tenant/Dono
exports.tipoMovimentoFinanceiro = (0, pg_core_1.pgEnum)("tipo_mov", ["c", "d"]); // c=Crédito, d=Débito
exports.situacaoTitulo = (0, pg_core_1.pgEnum)("situacao_titulo", [
    "aberto",
    "fechado",
    "parcial",
]);
exports.statusNegociacao = (0, pg_core_1.pgEnum)("status_negociacao", [
    "proposta",
    "analise",
    "contrato",
    "concluido",
    "cancelado",
]);
exports.tipoMidiaEnum = (0, pg_core_1.pgEnum)("tipo_midia", [
    "foto_interna",
    "foto_externa",
    "foto_360",
    "video",
    "planta_baixa",
]);
exports.tipoMov = (0, pg_core_1.pgEnum)("tipo_mov", ["c", "d"]);
// ==========================================
// 2. ESTRUTURA SAAS (MULTI-TENANCY)
// ==========================================
exports.tenants = (0, pg_core_1.pgTable)("tenants", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    nome_conta: (0, pg_core_1.varchar)("nome_conta", { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)("slug", { length: 100 }).unique().notNull(),
    dominio_customizado: (0, pg_core_1.varchar)("dominio_customizado", { length: 255 }).unique(),
    status: (0, exports.statusSaaS)("status").default("trial"),
    data_vencimento: (0, pg_core_1.timestamp)("data_vencimento"),
    email_financeiro: (0, pg_core_1.varchar)("email_financeiro", { length: 255 }).notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    version_schema: (0, pg_core_1.varchar)("version_schema", { length: 10 }).default("1.0.0"), // <--- CONTROLE
    last_migration: (0, pg_core_1.timestamp)("last_migration").defaultNow(),
});
exports.unidades = (0, pg_core_1.pgTable)("unidades", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id, { onDelete: "cascade" })
        .notNull(),
    nome: (0, pg_core_1.varchar)("nome", { length: 255 }).notNull(),
    cnpj: (0, pg_core_1.varchar)("cnpj", { length: 20 }),
    is_matriz: (0, pg_core_1.boolean)("is_matriz").default(false),
});
// =============================   =============
// ==========================================
exports.pessoas = (0, pg_core_1.pgTable)("pessoas", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id, { onDelete: "cascade" })
        .notNull(),
    unidade_id: (0, pg_core_1.integer)("unidade_id").references(() => exports.unidades.id),
    tipo: (0, exports.tipoFisicaJuridica)("tipo").default("f"),
    papel: (0, exports.papelPessoa)("papel").notNull(),
    nome: (0, pg_core_1.varchar)("nome", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    documento: (0, pg_core_1.varchar)("documento", { length: 20 }).notNull(),
    telefone: (0, pg_core_1.varchar)("telefone", { length: 20 }),
    is_admin: (0, pg_core_1.boolean)("is_admin").default(false),
    cargo: (0, pg_core_1.varchar)("cargo", { length: 50 }), // 'corretor', 'secretaria', 'financeiro', 'gerente'
    onboarding_status: (0, pg_core_1.jsonb)("onboarding_status").default({}),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => ({
    tenantIdx: (0, pg_core_1.index)("idx_pessoas_tenant").on(table.tenant_id),
    docIdx: (0, pg_core_1.index)("idx_pessoas_documento").on(table.documento),
}));
exports.enderecos = (0, pg_core_1.pgTable)("enderecos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    pessoa_id: (0, pg_core_1.uuid)("pessoa_id").references(() => exports.pessoas.id, {
        onDelete: "cascade",
    }),
    cep: (0, pg_core_1.varchar)("cep", { length: 10 }).notNull(),
    logradouro: (0, pg_core_1.varchar)("logradouro", { length: 255 }).notNull(),
    numero: (0, pg_core_1.varchar)("numero", { length: 20 }).notNull(),
    bairro: (0, pg_core_1.varchar)("bairro", { length: 100 }).notNull(),
    cidade: (0, pg_core_1.varchar)("cidade", { length: 100 }).notNull(),
    estado: (0, pg_core_1.varchar)("estado", { length: 2 }).notNull(),
});
// ==========================================
// 4. IMÓVEIS E MÍDIAS
// ==========================================
exports.imoveis = (0, pg_core_1.pgTable)("imoveis", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id, { onDelete: "cascade" })
        .notNull(),
    unidade_id: (0, pg_core_1.integer)("unidade_id").references(() => exports.unidades.id),
    titulo: (0, pg_core_1.varchar)("titulo", { length: 255 }).notNull(),
    descricao: (0, pg_core_1.text)("descricao"),
    tipo: (0, pg_core_1.varchar)("tipo", { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).default("disponivel"),
    preco_venda: (0, pg_core_1.decimal)("preco_venda", { precision: 12, scale: 2 }),
    preco_aluguel: (0, pg_core_1.decimal)("preco_aluguel", { precision: 12, scale: 2 }),
    area_privativa: (0, pg_core_1.decimal)("area_privativa", { precision: 10, scale: 2 }),
    endereco_original: (0, pg_core_1.text)("endereco_original").notNull(),
    video_url: (0, pg_core_1.text)("video_url"),
    lat: (0, pg_core_1.decimal)("lat", { precision: 10, scale: 8 }),
    lng: (0, pg_core_1.decimal)("lng", { precision: 11, scale: 8 }),
    proprietario_id: (0, pg_core_1.uuid)("proprietario_id").references(() => exports.pessoas.id),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
}, (table) => ({
    tenantImovelIdx: (0, pg_core_1.index)("idx_imoveis_tenant").on(table.tenant_id),
}));
exports.midias = (0, pg_core_1.pgTable)("midias", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    imovel_id: (0, pg_core_1.integer)("imovel_id").references(() => exports.imoveis.id, {
        onDelete: "cascade",
    }),
    url: (0, pg_core_1.text)("url").notNull(),
    tipo: (0, exports.tipoMidiaEnum)("tipo").default("foto_interna"),
    is_capa: (0, pg_core_1.boolean)("is_capa").default(false),
    ordem: (0, pg_core_1.integer)("ordem").default(0),
});
exports.instrucoesChegada = (0, pg_core_1.pgTable)("instrucoes_chegada", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    imovel_id: (0, pg_core_1.integer)("imovel_id").references(() => exports.imoveis.id, {
        onDelete: "cascade",
    }),
    ordem: (0, pg_core_1.integer)("ordem").notNull(),
    titulo: (0, pg_core_1.varchar)("titulo", { length: 100 }).notNull(),
    descricao: (0, pg_core_1.text)("descricao"),
    foto_url: (0, pg_core_1.text)("foto_url"),
});
// ==========================================
// 5. ATRIBUTOS DINÂMICOS (ACESSÓRIOS)
// ==========================================
exports.categoriasAtributos = (0, pg_core_1.pgTable)("categorias_atributos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id").references(() => exports.tenants.id),
    nome: (0, pg_core_1.varchar)("nome", { length: 100 }).notNull(),
});
exports.atributos = (0, pg_core_1.pgTable)("atributos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    categoria_id: (0, pg_core_1.integer)("categoria_id").references(() => exports.categoriasAtributos.id, { onDelete: "cascade" }),
    nome: (0, pg_core_1.varchar)("nome", { length: 100 }).notNull(),
});
exports.imoveisAtributos = (0, pg_core_1.pgTable)("imoveis_atributos", {
    imovel_id: (0, pg_core_1.integer)("imovel_id").references(() => exports.imoveis.id, {
        onDelete: "cascade",
    }),
    atributo_id: (0, pg_core_1.integer)("atributo_id").references(() => exports.atributos.id, {
        onDelete: "cascade",
    }),
}, (t) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [t.imovel_id, t.atributo_id] }),
}));
// ==========================================
// 6. FINANCEIRO E CAIXA (SISTEMA CONTÁBIL)
// ==========================================
exports.grupoCaixa = (0, pg_core_1.pgTable)("grupo_caixa", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id").references(() => exports.tenants.id),
    codigo: (0, pg_core_1.varchar)("codigo", { length: 20 }), // ex: 1.01
    descricao: (0, pg_core_1.varchar)("descricao", { length: 100 }).notNull(),
    tipo: (0, exports.tipoMovimentoFinanceiro)("tipo").notNull(),
});
exports.contasBancarias = (0, pg_core_1.pgTable)("contas_bancarias", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id, { onDelete: "cascade" })
        .notNull(),
    banco_id: (0, pg_core_1.integer)("banco_id")
        .references(() => exports.bancos.id)
        .notNull(),
    apelido: (0, pg_core_1.varchar)("apelido", { length: 50 }).notNull(),
    agencia: (0, pg_core_1.varchar)("agencia", { length: 20 }).notNull(),
    conta: (0, pg_core_1.varchar)("conta", { length: 30 }).notNull(),
    digito: (0, pg_core_1.varchar)("digito", { length: 10 }).notNull(),
    pix: (0, pg_core_1.varchar)("pix", { length: 255 }),
});
exports.bancos = (0, pg_core_1.pgTable)("bancos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    codigo_compe: (0, pg_core_1.varchar)("codigo_compe", { length: 10 }).unique().notNull(),
    nome: (0, pg_core_1.varchar)("nome", { length: 100 }).notNull(),
});
exports.titulos = (0, pg_core_1.pgTable)("titulos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id)
        .notNull(),
    pessoa_id: (0, pg_core_1.uuid)("pessoa_id").references(() => exports.pessoas.id),
    conta_bancaria_id: (0, pg_core_1.integer)("conta_bancaria_id").references(() => exports.contasBancarias.id),
    valor_nominal: (0, pg_core_1.decimal)("valor_nominal", {
        precision: 12,
        scale: 2,
    }).notNull(),
    tipomov: (0, exports.tipoMovimentoFinanceiro)("tipo").notNull(),
    juros: (0, pg_core_1.decimal)("juros", { precision: 12, scale: 2 }).default("0"),
    valor_total: (0, pg_core_1.decimal)("valor_total", { precision: 12, scale: 2 }).notNull(),
    saldo: (0, pg_core_1.decimal)("saldo", { precision: 12, scale: 2 }).notNull(),
    data_emissao: (0, pg_core_1.timestamp)("data_emissao").defaultNow(),
    data_vencimento: (0, pg_core_1.timestamp)("data_vencimento").notNull(),
    situacao: (0, exports.situacaoTitulo)("situacao").default("aberto"),
});
exports.pagamentos = (0, pg_core_1.pgTable)("pagamentos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    titulo_id: (0, pg_core_1.integer)("titulo_id").references(() => exports.titulos.id, {
        onDelete: "cascade",
    }),
    grupo_caixa_id: (0, pg_core_1.integer)("grupo_caixa_id").references(() => exports.grupoCaixa.id),
    valor_pago: (0, pg_core_1.decimal)("valor_pago", { precision: 12, scale: 2 }).notNull(),
    data_pagamento: (0, pg_core_1.timestamp)("data_pagamento").defaultNow(),
});
exports.caixa = (0, pg_core_1.pgTable)("caixa", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id)
        .notNull(),
    grupo_caixa_id: (0, pg_core_1.integer)("grupo_caixa_id").references(() => exports.grupoCaixa.id),
    pagamento_id: (0, pg_core_1.integer)("pagamento_id").references(() => exports.pagamentos.id),
    tipo: (0, exports.tipoMovimentoFinanceiro)("tipo").notNull(),
    valor: (0, pg_core_1.decimal)("valor", { precision: 12, scale: 2 }).notNull(),
    saldo_anterior: (0, pg_core_1.decimal)("saldo_anterior", { precision: 12, scale: 2 }),
    saldo_atual: (0, pg_core_1.decimal)("saldo_atual", { precision: 12, scale: 2 }),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// ==========================================
// 7. NEGOCIAÇÕES E TIMELINE (CRM)
// ==========================================
exports.negociacoes = (0, pg_core_1.pgTable)("negociacoes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id")
        .references(() => exports.tenants.id, { onDelete: "cascade" })
        .notNull(),
    imovel_id: (0, pg_core_1.integer)("imovel_id").references(() => exports.imoveis.id),
    corretor_id: (0, pg_core_1.uuid)("corretor_id").references(() => exports.pessoas.id),
    cliente_id: (0, pg_core_1.uuid)("cliente_id").references(() => exports.pessoas.id),
    status: (0, exports.statusNegociacao)("status").default("proposta"),
    valor_proposta: (0, pg_core_1.decimal)("valor_proposta", { precision: 12, scale: 2 }),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.movNegociacao = (0, pg_core_1.pgTable)("mov_negociacao", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    negociacao_id: (0, pg_core_1.integer)("negociacao_id").references(() => exports.negociacoes.id, {
        onDelete: "cascade",
    }),
    usuario_id: (0, pg_core_1.uuid)("usuario_id").references(() => exports.pessoas.id),
    descricao: (0, pg_core_1.text)("descricao").notNull(),
    motivo: (0, pg_core_1.varchar)("motivo", { length: 50 }).notNull(), // visita, contato, fechamento...
    data_atual: (0, pg_core_1.timestamp)("data_atual").defaultNow(),
    data_proximo_contato: (0, pg_core_1.timestamp)("data_proximo_contato"),
});
// ==========================================
// 8. INTELIGÊNCIA ARTIFICIAL (IA / MCP)
// ==========================================
exports.baseConhecimento = (0, pg_core_1.pgTable)("base_conhecimento", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id"),
    categoria: (0, pg_core_1.varchar)("categoria", { length: 50 }), // suporte, marketing, financeiro
    pergunta_contexto: (0, pg_core_1.text)("pergunta_contexto"),
    resposta_base: (0, pg_core_1.text)("resposta_base"),
    tags: (0, pg_core_1.text)("tags"),
});
exports.aiConversas = (0, pg_core_1.pgTable)("ai_conversas", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    pessoa_id: (0, pg_core_1.uuid)("pessoa_id").references(() => exports.pessoas.id),
    contexto: (0, pg_core_1.jsonb)("contexto"),
    last_interaction: (0, pg_core_1.timestamp)("last_interaction").defaultNow(),
});
// ==========================================
// 9. AUDITORIA (LOGS)
// ==========================================
exports.logsAtividades = (0, pg_core_1.pgTable)("logs_atividades", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    tenant_id: (0, pg_core_1.uuid)("tenant_id").references(() => exports.tenants.id),
    usuario_id: (0, pg_core_1.uuid)("usuario_id").references(() => exports.pessoas.id),
    operacao: (0, pg_core_1.varchar)("operacao", { length: 1 }).notNull(), // i, a, d
    descricao: (0, pg_core_1.text)("descricao"),
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// ==========================================
// 10. RELAÇÕES (DRIZZLE RELATIONAL API - COMPLETO)
// ==========================================
// RELAÇÕES DO IMÓVEL
exports.imoveisRelations = (0, drizzle_orm_1.relations)(exports.imoveis, ({ one, many }) => ({
    midias: many(exports.midias),
    instrucoes: many(exports.instrucoesChegada),
    negociacoes: many(exports.negociacoes),
    tenant: one(exports.tenants, {
        fields: [exports.imoveis.tenant_id],
        references: [exports.tenants.id],
    }),
    proprietario: one(exports.pessoas, {
        fields: [exports.imoveis.proprietario_id],
        references: [exports.pessoas.id],
    }),
    // A RELAÇÃO QUE FALTAVA: Conecta o imóvel à tabela de ligação de acessórios
    atributos: many(exports.imoveisAtributos),
}));
// RELAÇÕES DA TABELA DE LIGAÇÃO (IMÓVEL <-> ATRIBUTO)
// Esta é a peça que faz o JOIN funcionar na Query API
exports.imoveisAtributosRelations = (0, drizzle_orm_1.relations)(exports.imoveisAtributos, ({ one }) => ({
    imovel: one(exports.imoveis, {
        fields: [exports.imoveisAtributos.atributo_id],
        references: [exports.imoveis.id],
    }),
    atributo: one(exports.atributos, {
        fields: [exports.imoveisAtributos.atributo_id],
        references: [exports.atributos.id],
    }),
}));
// RELAÇÕES DOS ATRIBUTOS (ITENS)
exports.atributosRelations = (0, drizzle_orm_1.relations)(exports.atributos, ({ one, many }) => ({
    categoria: one(exports.categoriasAtributos, {
        fields: [exports.atributos.categoria_id],
        references: [exports.categoriasAtributos.id],
    }),
    // Permite saber quais imóveis possuem este atributo
    imoveis: many(exports.imoveisAtributos),
}));
// RELAÇÕES DE NEGOCIAÇÕES
exports.negociacoesRelations = (0, drizzle_orm_1.relations)(exports.negociacoes, ({ one, many }) => ({
    movimentacoes: many(exports.movNegociacao),
    imovel: one(exports.imoveis, {
        fields: [exports.negociacoes.imovel_id],
        references: [exports.imoveis.id],
    }),
    cliente: one(exports.pessoas, {
        fields: [exports.negociacoes.cliente_id],
        references: [exports.pessoas.id],
    }),
    corretor: one(exports.pessoas, {
        fields: [exports.negociacoes.corretor_id],
        references: [exports.pessoas.id],
    }),
}));
// RELAÇÕES FINANCEIRAS
exports.titulosRelations = (0, drizzle_orm_1.relations)(exports.titulos, ({ one, many }) => ({
    pagamentos: many(exports.pagamentos),
    tenant: one(exports.tenants, {
        fields: [exports.titulos.tenant_id],
        references: [exports.tenants.id],
    }),
    pessoa: one(exports.pessoas, {
        fields: [exports.titulos.pessoa_id],
        references: [exports.pessoas.id],
    }),
}));
exports.pagamentosRelations = (0, drizzle_orm_1.relations)(exports.pagamentos, ({ one }) => ({
    titulo: one(exports.titulos, {
        fields: [exports.pagamentos.titulo_id],
        references: [exports.titulos.id],
    }),
    caixa: one(exports.caixa, {
        fields: [exports.pagamentos.id],
        references: [exports.caixa.pagamento_id],
    }),
}));
