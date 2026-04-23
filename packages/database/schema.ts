import {
  pgTable,
  serial,
  text,
  varchar,
  decimal,
  integer,
  boolean,
  timestamp,
  pgEnum,
  uuid,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. ENUMS (PADRONIZAÇÃO GLOBAL)
// ==========================================
export const tipoFisicaJuridica = pgEnum("tipo_entidade", ["f", "j"]);
export const statusSaaS = pgEnum("status_saas", [
  "trial",
  "ativo",
  "inadimplente",
  "suspenso",
]);
export const papelPessoa = pgEnum("papel_pessoa", [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
]);
// 1=Corretor/Admin, 2=Interessado/Lead, 3=Proprietário, 4=Inquilino, 5=Unidade, 6=Tenant/Dono
export const tipoMovimentoFinanceiro = pgEnum("tipo_mov", ["c", "d"]); // c=Crédito, d=Débito
export const situacaoTitulo = pgEnum("situacao_titulo", [
  "aberto",
  "fechado",
  "parcial",
]);
export const statusNegociacao = pgEnum("status_negociacao", [
  "proposta",
  "analise",
  "contrato",
  "concluido",
  "cancelado",
]);
export const tipoMidiaEnum = pgEnum("tipo_midia", [
  "foto_interna",
  "foto_externa",
  "foto_360",
  "video",
  "planta_baixa",
]);
export const tipoMov = pgEnum("tipo_mov", ["c", "d"]);

// ==========================================
// 2. ESTRUTURA SAAS (MULTI-TENANCY)
// ==========================================
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome_conta: varchar("nome_conta", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  dominio_customizado: varchar("dominio_customizado", { length: 255 }).unique(),
  status: statusSaaS("status").default("trial"),
  data_vencimento: timestamp("data_vencimento"),
  email_financeiro: varchar("email_financeiro", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  version_schema: varchar("version_schema", { length: 10 }).default("1.0.0"), // <--- CONTROLE
  last_migration: timestamp("last_migration").defaultNow(),
});

export const unidades = pgTable("unidades", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  is_matriz: boolean("is_matriz").default(false),
});

// ==========================================
// 3. PESSOAS (CRM UNIFICADO)
// ==========================================
export const pessoas = pgTable(
  "pessoas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenant_id: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    unidade_id: integer("unidade_id").references(() => unidades.id),
    tipo: tipoFisicaJuridica("tipo").default("f"),
    papel: papelPessoa("papel").notNull(),
    nome: varchar("nome", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    documento: varchar("documento", { length: 20 }).notNull(),
    telefone: varchar("telefone", { length: 20 }),
    is_admin: boolean("is_admin").default(false),
    cargo: varchar("cargo", { length: 50 }), // 'corretor', 'secretaria', 'financeiro', 'gerente'
    onboarding_status: jsonb("onboarding_status").default({}),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    tenantIdx: index("idx_pessoas_tenant").on(table.tenant_id),
    docIdx: index("idx_pessoas_documento").on(table.documento),
  }),
);

export const enderecos = pgTable("enderecos", {
  id: serial("id").primaryKey(),
  pessoa_id: uuid("pessoa_id").references(() => pessoas.id, {
    onDelete: "cascade",
  }),
  cep: varchar("cep", { length: 10 }).notNull(),
  logradouro: varchar("logradouro", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
});

// ==========================================
// 4. IMÓVEIS E MÍDIAS
// ==========================================
export const imoveis = pgTable(
  "imoveis",
  {
    id: serial("id").primaryKey(),
    tenant_id: uuid("tenant_id")
      .references(() => tenants.id, { onDelete: "cascade" })
      .notNull(),
    unidade_id: integer("unidade_id").references(() => unidades.id),
    titulo: varchar("titulo", { length: 255 }).notNull(),
    descricao: text("descricao"),
    tipo: varchar("tipo", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).default("disponivel"),
    preco_venda: decimal("preco_venda", { precision: 12, scale: 2 }),
    preco_aluguel: decimal("preco_aluguel", { precision: 12, scale: 2 }),
    area_privativa: decimal("area_privativa", { precision: 10, scale: 2 }),
    endereco_original: text("endereco_original").notNull(),
    video_url: text("video_url"),
    lat: decimal("lat", { precision: 10, scale: 8 }),
    lng: decimal("lng", { precision: 11, scale: 8 }),
    proprietario_id: uuid("proprietario_id").references(() => pessoas.id),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    tenantImovelIdx: index("idx_imoveis_tenant").on(table.tenant_id),
  }),
);

export const midias = pgTable("midias", {
  id: serial("id").primaryKey(),
  imovel_id: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  tipo: tipoMidiaEnum("tipo").default("foto_interna"),
  is_capa: boolean("is_capa").default(false),
  ordem: integer("ordem").default(0),
});

export const instrucoesChegada = pgTable("instrucoes_chegada", {
  id: serial("id").primaryKey(),
  imovel_id: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  ordem: integer("ordem").notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  descricao: text("descricao"),
  foto_url: text("foto_url"),
});

// ==========================================
// 5. ATRIBUTOS DINÂMICOS (ACESSÓRIOS)
// ==========================================
export const categoriasAtributos = pgTable("categorias_atributos", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id").references(() => tenants.id),
  nome: varchar("nome", { length: 100 }).notNull(),
});

export const atributos = pgTable("atributos", {
  id: serial("id").primaryKey(),
  categoria_id: integer("categoria_id").references(
    () => categoriasAtributos.id,
    { onDelete: "cascade" },
  ),
  nome: varchar("nome", { length: 100 }).notNull(),
});

export const imoveisAtributos = pgTable(
  "imoveis_atributos",
  {
    imovel_id: integer("imovel_id").references(() => imoveis.id, {
      onDelete: "cascade",
    }),
    atributo_id: integer("atributo_id").references(() => atributos.id, {
      onDelete: "cascade",
    }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.imovel_id, t.atributo_id] }),
  }),
);

// ==========================================
// 6. FINANCEIRO E CAIXA (SISTEMA CONTÁBIL)
// ==========================================

export const grupoCaixa = pgTable("grupo_caixa", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id").references(() => tenants.id),
  codigo: varchar("codigo", { length: 20 }), // ex: 1.01
  descricao: varchar("descricao", { length: 100 }).notNull(),
  tipo: tipoMovimentoFinanceiro("tipo").notNull(),
});

export const contasBancarias = pgTable("contas_bancarias", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  banco_id: integer("banco_id")
    .references(() => bancos.id)
    .notNull(),
  apelido: varchar("apelido", { length: 50 }).notNull(),
  agencia: varchar("agencia", { length: 20 }).notNull(),
  conta: varchar("conta", { length: 30 }).notNull(),
  digito: varchar("digito", { length: 10 }).notNull(),
  pix: varchar("pix", { length: 255 }),
});

export const bancos = pgTable("bancos", {
  id: serial("id").primaryKey(),
  codigo_compe: varchar("codigo_compe", { length: 10 }).unique().notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
});

export const titulos = pgTable("titulos", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  pessoa_id: uuid("pessoa_id").references(() => pessoas.id),
  conta_bancaria_id: integer("conta_bancaria_id").references(
    () => contasBancarias.id,
  ),
  valor_nominal: decimal("valor_nominal", {
    precision: 12,
    scale: 2,
  }).notNull(),
  tipomov: tipoMovimentoFinanceiro("tipo").notNull(),
  juros: decimal("juros", { precision: 12, scale: 2 }).default("0"),
  valor_total: decimal("valor_total", { precision: 12, scale: 2 }).notNull(),
  saldo: decimal("saldo", { precision: 12, scale: 2 }).notNull(),
  data_emissao: timestamp("data_emissao").defaultNow(),
  data_vencimento: timestamp("data_vencimento").notNull(),
  situacao: situacaoTitulo("situacao").default("aberto"),
});

export const pagamentos = pgTable("pagamentos", {
  id: serial("id").primaryKey(),
  titulo_id: integer("titulo_id").references(() => titulos.id, {
    onDelete: "cascade",
  }),
  grupo_caixa_id: integer("grupo_caixa_id").references(() => grupoCaixa.id),
  valor_pago: decimal("valor_pago", { precision: 12, scale: 2 }).notNull(),
  data_pagamento: timestamp("data_pagamento").defaultNow(),
});

export const caixa = pgTable("caixa", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  grupo_caixa_id: integer("grupo_caixa_id").references(() => grupoCaixa.id),
  pagamento_id: integer("pagamento_id").references(() => pagamentos.id),
  tipo: tipoMovimentoFinanceiro("tipo").notNull(),
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  saldo_anterior: decimal("saldo_anterior", { precision: 12, scale: 2 }),
  saldo_atual: decimal("saldo_atual", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
});

// ==========================================
// 7. NEGOCIAÇÕES E TIMELINE (CRM)
// ==========================================
export const negociacoes = pgTable("negociacoes", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  imovel_id: integer("imovel_id").references(() => imoveis.id),
  corretor_id: uuid("corretor_id").references(() => pessoas.id),
  cliente_id: uuid("cliente_id").references(() => pessoas.id),
  status: statusNegociacao("status").default("proposta"),
  valor_proposta: decimal("valor_proposta", { precision: 12, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const movNegociacao = pgTable("mov_negociacao", {
  id: serial("id").primaryKey(),
  negociacao_id: integer("negociacao_id").references(() => negociacoes.id, {
    onDelete: "cascade",
  }),
  usuario_id: uuid("usuario_id").references(() => pessoas.id),
  descricao: text("descricao").notNull(),
  motivo: varchar("motivo", { length: 50 }).notNull(), // visita, contato, fechamento...
  data_atual: timestamp("data_atual").defaultNow(),
  data_proximo_contato: timestamp("data_proximo_contato"),
});

// ==========================================
// 8. INTELIGÊNCIA ARTIFICIAL (IA / MCP)
// ==========================================
export const baseConhecimento = pgTable("base_conhecimento", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id"),
  categoria: varchar("categoria", { length: 50 }), // suporte, marketing, financeiro
  pergunta_contexto: text("pergunta_contexto"),
  resposta_base: text("resposta_base"),
  tags: text("tags"),
});

export const aiConversas = pgTable("ai_conversas", {
  id: uuid("id").defaultRandom().primaryKey(),
  pessoa_id: uuid("pessoa_id").references(() => pessoas.id),
  contexto: jsonb("contexto"),
  last_interaction: timestamp("last_interaction").defaultNow(),
});

// ==========================================
// 9. AUDITORIA (LOGS)
// ==========================================
export const logsAtividades = pgTable("logs_atividades", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id").references(() => tenants.id),
  usuario_id: uuid("usuario_id").references(() => pessoas.id),
  operacao: varchar("operacao", { length: 1 }).notNull(), // i, a, d
  descricao: text("descricao"),
  created_at: timestamp("created_at").defaultNow(),
});

// ==========================================
// 10. RELAÇÕES (DRIZZLE RELATIONAL API - COMPLETO)
// ==========================================

// RELAÇÕES DO IMÓVEL
export const imoveisRelations = relations(imoveis, ({ one, many }) => ({
  midias: many(midias),
  instrucoes: many(instrucoesChegada),
  negociacoes: many(negociacoes),
  tenant: one(tenants, {
    fields: [imoveis.tenant_id],
    references: [tenants.id],
  }),
  proprietario: one(pessoas, {
    fields: [imoveis.proprietario_id],
    references: [pessoas.id],
  }),

  // A RELAÇÃO QUE FALTAVA: Conecta o imóvel à tabela de ligação de acessórios
  atributos: many(imoveisAtributos),
}));

// RELAÇÕES DA TABELA DE LIGAÇÃO (IMÓVEL <-> ATRIBUTO)
// Esta é a peça que faz o JOIN funcionar na Query API
export const imoveisAtributosRelations = relations(
  imoveisAtributos,
  ({ one }) => ({
    imovel: one(imoveis, {
      fields: [imoveisAtributos.atributo_id],
      references: [imoveis.id],
    }),
    atributo: one(atributos, {
      fields: [imoveisAtributos.atributo_id],
      references: [atributos.id],
    }),
  }),
);

// RELAÇÕES DOS ATRIBUTOS (ITENS)
export const atributosRelations = relations(atributos, ({ one, many }) => ({
  categoria: one(categoriasAtributos, {
    fields: [atributos.categoria_id],
    references: [categoriasAtributos.id],
  }),
  // Permite saber quais imóveis possuem este atributo
  imoveis: many(imoveisAtributos),
}));

// RELAÇÕES DE NEGOCIAÇÕES
export const negociacoesRelations = relations(negociacoes, ({ one, many }) => ({
  movimentacoes: many(movNegociacao),
  imovel: one(imoveis, {
    fields: [negociacoes.imovel_id],
    references: [imoveis.id],
  }),
  cliente: one(pessoas, {
    fields: [negociacoes.cliente_id],
    references: [pessoas.id],
  }),
  corretor: one(pessoas, {
    fields: [negociacoes.corretor_id],
    references: [pessoas.id],
  }),
}));

// RELAÇÕES FINANCEIRAS
export const titulosRelations = relations(titulos, ({ one, many }) => ({
  pagamentos: many(pagamentos),
  tenant: one(tenants, {
    fields: [titulos.tenant_id],
    references: [tenants.id],
  }),
  pessoa: one(pessoas, {
    fields: [titulos.pessoa_id],
    references: [pessoas.id],
  }),
}));

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  titulo: one(titulos, {
    fields: [pagamentos.titulo_id],
    references: [titulos.id],
  }),
  caixa: one(caixa, {
    fields: [pagamentos.id],
    references: [caixa.pagamento_id],
  }),
}));
