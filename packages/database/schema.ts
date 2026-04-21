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
// 1. ENUMS (OS GRUPOS DE DEFINIÇÃO)
// ==========================================
export const tipoFisicaJuridica = pgEnum("tipo_entidade", ["f", "j"]);
export const papelPessoaEnum = pgEnum("papel_pessoa", [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
]);
export const tipoImovelEnum = pgEnum("tipo_imovel", [
  "casa",
  "apartamento",
  "terreno",
  "comercial",
  "cobertura",
]);
export const statusImovelEnum = pgEnum("status_imovel", [
  "disponivel",
  "reservado",
  "vendido",
  "alugado",
]);
export const tipoMidiaEnum = pgEnum("tipo_midia", [
  "foto_interna",
  "foto_externa",
  "foto_360",
  "video",
  "planta_baixa",
]);

// ==========================================
// 2. NÚCLEO SaaS E CRM
// ==========================================
export const pessoas = pgTable(
  "pessoas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    imobiliariaId: uuid("imobiliaria_id"), // Referência à pessoa tipo 5
    tipo: tipoFisicaJuridica("tipo").default("f"),
    papel: papelPessoaEnum("papel").notNull(),
    nome: varchar("nome", { length: 255 }).notNull(),
    documento: varchar("documento", { length: 20 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    telefone: varchar("telefone", { length: 20 }),
    isAdmin: boolean("is_admin").default(false),
    dominio: varchar("dominio", { length: 255 }),
    slug: varchar("slug", { length: 100 }),

    // Status de Treinamento da IA
    onboardingStatus: jsonb("onboarding_status").default({
      passoAtual: 0,
      concluiuTreinamento360: false,
      perfilConfigurado: false,
    }),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    imobPapelIdx: index("imob_papel_idx").on(table.imobiliariaId, table.papel),
    docIdx: index("documento_idx").on(table.documento),
  }),
);

export const enderecos = pgTable("enderecos", {
  id: serial("id").primaryKey(),
  pessoaId: uuid("pessoa_id").references(() => pessoas.id, {
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
// 3. IMÓVEIS E ACESSÓRIOS DINÂMICOS
// ==========================================
export const imoveis = pgTable("imoveis", {
  id: serial("id").primaryKey(),
  imobiliariaId: uuid("imobiliaria_id").references(() => pessoas.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: tipoImovelEnum("tipo").notNull(),
  status: statusImovelEnum("status").default("disponivel"),
  proprietarioId: uuid("proprietario_id").references(() => pessoas.id),
  precoVenda: decimal("preco_venda", { precision: 12, scale: 2 }),
  areaPrivativa: decimal("area_privativa", {
    precision: 10,
    scale: 2,
  }).notNull(),
  enderecoOriginal: text("endereco_original").notNull(),
  videoUrl: text("video_url"),
  lat: decimal("lat", { precision: 10, scale: 8 }),
  lng: decimal("lng", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de Itens (Piscina, Ar Condicionado, etc)
export const acessorios = pgTable("acessorios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  categoria: varchar("categoria", { length: 50 }), // Lazer, Segurança, Estrutura
});

// Ligação Imóvel <-> Acessórios
export const imoveisAcessorios = pgTable(
  "imoveis_acessorios",
  {
    imovelId: integer("imovel_id").references(() => imoveis.id, {
      onDelete: "cascade",
    }),
    acessorioId: integer("acessorio_id").references(() => acessorios.id, {
      onDelete: "cascade",
    }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.imovelId, t.acessorioId] }),
  }),
);

// ==========================================
// 4. MÍDIAS E AUDITORIA
// ==========================================
export const midiaImovel = pgTable("midia_imovel", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  tipo: tipoMidiaEnum("tipo").default("foto_interna"),
  isCapa: boolean("is_capa").default(false),
});

export const logsAtividades = pgTable("logs_atividades", {
  id: serial("id").primaryKey(),
  imobiliariaId: uuid("imobiliaria_id").notNull(),
  usuarioId: uuid("usuario_id").notNull(),
  operacao: varchar("operacao", { length: 1 }).notNull(), // i, a, d
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow(),
});

// RELAÇÕES (Query API)
export const imoveisRelations = relations(imoveis, ({ one, many }) => ({
  midias: many(midiaImovel),
  acessorios: many(imoveisAcessorios),
}));

export const imoveisAcessoriosRelations = relations(
  imoveisAcessorios,
  ({ one }) => ({
    acessorio: one(acessorios, {
      fields: [imoveisAcessorios.acessorioId],
      references: [acessorios.id],
    }),
  }),
);
