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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- 1. ENUMS (PADRONIZAÇÃO) ---

// f=fisica, j=juridica
export const tipoFisicaJuridica = pgEnum("tipo_entidade", ["f", "j"]);

// 1=usuario, 2=cliente, 3=proprietário, 4=inquilino, 5=imobiliaria, 6=tenant (SaaS)
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

// --- 2. PESSOAS (ENTIDADE UNIFICADA COM ÍNDICES) ---

export const pessoas = pgTable(
  "pessoas",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Identificadores de Lógica
    tipo: tipoFisicaJuridica("tipo").default("f"),
    papel: papelPessoaEnum("papel").notNull(),

    // Multi-tenancy: Aponta para o ID da Imobiliária (Tipo 5) dona deste registro
    // Para registros tipo 5 e 6, este campo pode ser nulo.
    imobiliariaId: uuid("imobiliaria_id"),

    // Dados Cadastrais
    nome: varchar("nome", { length: 255 }).notNull(), // Nome ou Razão Social
    documento: varchar("documento", { length: 20 }).unique().notNull(), // CPF ou CNPJ
    email: varchar("email", { length: 255 }).notNull(),
    telefone: varchar("telefone", { length: 20 }),

    // Controle SaaS (Específico para Papel 6 - Tenants da Flaience)
    statusAssinatura: varchar("status_assinatura", { length: 20 }).default(
      "ativo",
    ),
    vencimentoAssinatura: timestamp("vencimento_assinatura"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    dominio: varchar("dominio", { length: 255 }).unique(), // Ex: 'sismob.flaience.com'
    slug: varchar("slug", { length: 100 }).unique(),
  },
  (table) => {
    return {
      // ÍNDICES PARA ALTA PERFORMANCE:
      // 1. Busca ultra-rápida por Imobiliária e Papel (Ex: Inquilinos da Imob X)
      imobPapelIdx: index("imob_papel_idx").on(
        table.imobiliariaId,
        table.papel,
      ),
      // 2. Busca rápida por Documento (CPF/CNPJ)
      docIdx: index("documento_idx").on(table.documento),
      // 3. Busca rápida por Papel isolado (Ex: Todos os Tenants da Flaience)
      papelIdx: index("papel_idx").on(table.papel),
    };
  },
);

// --- 3. ENDEREÇOS ---

export const enderecos = pgTable("enderecos", {
  id: serial("id").primaryKey(),
  pessoaId: uuid("pessoa_id").references(() => pessoas.id, {
    onDelete: "cascade",
  }),

  cep: varchar("cep", { length: 10 }).notNull(),
  logradouro: varchar("logradouro", { length: 255 }).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  complemento: varchar("complemento", { length: 100 }),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),

  tipoEndereco: varchar("tipo_endereco", { length: 50 }).default("principal"),
});

// --- 4. IMÓVEIS ---

export const imoveis = pgTable(
  "imoveis",
  {
    id: serial("id").primaryKey(),
    imobiliariaId: uuid("imobiliaria_id").references(() => pessoas.id), // Link para Pessoa Tipo 5

    titulo: varchar("titulo", { length: 255 }).notNull(),
    descricao: text("descricao"),
    tipo: tipoImovelEnum("tipo").notNull(),
    status: statusImovelEnum("status").default("disponivel"),

    // Vínculos usando IDs da mesma tabela de pessoas
    proprietarioId: uuid("proprietario_id").references(() => pessoas.id), // Pessoa Tipo 3
    inquilinoId: uuid("inquilino_id").references(() => pessoas.id), // Pessoa Tipo 4

    precoVenda: decimal("preco_venda", { precision: 12, scale: 2 }),
    precoAluguel: decimal("preco_aluguel", { precision: 12, scale: 2 }),
    areaPrivativa: decimal("area_privativa", {
      precision: 10,
      scale: 2,
    }).notNull(),

    enderecoOriginal: text("endereco_original").notNull(),
    lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
    lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),

    tourVirtualUrl: text("tour_virtual_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      imobImovelIdx: index("imob_imovel_idx").on(table.imobiliariaId),
    };
  },
);

// --- 5. DIFERENCIAIS (MÍDIA, INFRA, PERCURSO) ---

export const midiaImovel = pgTable("midia_imovel", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  tipo: tipoMidiaEnum("tipo").default("foto_interna"),
  isCapa: boolean("is_capa").default(false),
  ordem: integer("ordem").default(0),
});

export const infraestrutura = pgTable("infraestrutura", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  temAguaQuente: boolean("tem_agua_quente").default(false),
  temEsperaSplit: boolean("tem_espera_split").default(false),
  mobiliado: boolean("mobiliado").default(false),
  permitePets: boolean("permite_pets").default(true),
});

export const instrucoesChegada = pgTable("instrucoes_chegada", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  ordem: integer("ordem").notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  descricao: text("descricao"),
  fotoUrl: text("foto_url"),
  latAlvo: decimal("lat_alvo", { precision: 10, scale: 8 }),
  lngAlvo: decimal("lng_alvo", { precision: 11, scale: 8 }),
});

// --- 6. RELAÇÕES (DRIZZLE RELATIONAL API) ---

export const pessoasRelations = relations(pessoas, ({ many }) => ({
  enderecos: many(enderecos),
  imoveisComoProprietario: many(imoveis, { relationName: "proprietario" }),
  imoveisComoInquilino: many(imoveis, { relationName: "inquilino" }),
}));

export const imoveisRelations = relations(imoveis, ({ one, many }) => ({
  imobiliaria: one(pessoas, {
    fields: [imoveis.imobiliariaId],
    references: [pessoas.id],
  }),
  proprietario: one(pessoas, {
    fields: [imoveis.proprietarioId],
    references: [pessoas.id],
    relationName: "proprietario",
  }),
  inquilino: one(pessoas, {
    fields: [imoveis.inquilinoId],
    references: [pessoas.id],
    relationName: "inquilino",
  }),
  midias: many(midiaImovel),
  infraestrutura: one(infraestrutura, {
    fields: [imoveis.id],
    references: [infraestrutura.imovelId],
  }),
  instrucoes: many(instrucoesChegada),
}));

export const midiaRelations = relations(midiaImovel, ({ one }) => ({
  imovel: one(imoveis, {
    fields: [midiaImovel.imovelId],
    references: [imoveis.id],
  }),
}));

export const instrucoesRelations = relations(instrucoesChegada, ({ one }) => ({
  imovel: one(imoveis, {
    fields: [instrucoesChegada.imovelId],
    references: [imoveis.id],
  }),
}));
