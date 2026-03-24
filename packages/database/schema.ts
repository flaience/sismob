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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Definição de Enums
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

// 2. Tabela Principal de Imóveis
export const imoveis = pgTable("imoveis", {
  id: serial("id").primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: tipoImovelEnum("tipo").notNull(),
  status: statusImovelEnum("status").default("disponivel"),

  precoVenda: decimal("preco_venda", { precision: 12, scale: 2 }),
  precoAluguel: decimal("preco_aluguel", { precision: 12, scale: 2 }),
  valorIptu: decimal("valor_iptu", { precision: 10, scale: 2 }),
  valorCondominio: decimal("valor_condominio", { precision: 10, scale: 2 }),

  areaPrivativa: decimal("area_privativa", {
    precision: 10,
    scale: 2,
  }).notNull(),
  areaTotal: decimal("area_total", { precision: 10, scale: 2 }),

  quartos: integer("quartos").default(0),
  suites: integer("suites").default(0),
  banheiros: integer("banheiros").default(0),
  vagasGaragem: integer("vagas_garagem").default(0),

  endereco: text("endereco").notNull(),
  bairro: varchar("bairro", { length: 100 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),

  tourVirtualUrl: text("tour_virtual_url"),
  videoApresentacaoUrl: text("video_url"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3. Infraestrutura
export const infraestrutura = pgTable("infraestrutura", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  temAguaQuente: boolean("tem_agua_quente").default(false),
  temEsperaSplit: boolean("tem_espera_split").default(false),
  temGasCentral: boolean("tem_gas_central").default(false),
  temChurrasqueira: boolean("tem_churrasqueira").default(false),
  temLareira: boolean("tem_lareira").default(false),
  temPiscina: boolean("tem_piscina").default(false),
  permitePets: boolean("permite_pets").default(true),
  mobiliado: boolean("mobiliado").default(false),
});

// 4. Inventário
export const inventario = pgTable("inventario", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  item: varchar("item", { length: 100 }).notNull(),
  quantidade: integer("quantidade").default(1),
  estadoConservacao: varchar("estado", { length: 50 }),
});

// 5. Instruções de Chegada
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

// 6. Galeria de Fotos
export const midiaImovel = pgTable("midia_imovel", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id").references(() => imoveis.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  tipo: varchar("tipo", { length: 20 })
    .$type<"foto" | "foto360" | "planta">()
    .default("foto"),
  ordem: integer("ordem").default(0),
});

// RELATIONS - ESSENCIAL PARA O .findMany({ with: {...} })
export const imoveisRelations = relations(imoveis, ({ one, many }) => ({
  infraestrutura: one(infraestrutura, {
    fields: [imoveis.id],
    references: [infraestrutura.imovelId],
  }),
  inventario: many(inventario),
  instrucoes: many(instrucoesChegada),
  midias: many(midiaImovel),
}));

export const infraestruturaRelations = relations(infraestrutura, ({ one }) => ({
  imovel: one(imoveis, {
    fields: [infraestrutura.imovelId],
    references: [imoveis.id],
  }),
}));

export const inventarioRelations = relations(inventario, ({ one }) => ({
  imovel: one(imoveis, {
    fields: [inventario.imovelId],
    references: [imoveis.id],
  }),
}));

export const instrucoesRelations = relations(instrucoesChegada, ({ one }) => ({
  imovel: one(imoveis, {
    fields: [instrucoesChegada.imovelId],
    references: [imoveis.id],
  }),
}));

export const midiaRelations = relations(midiaImovel, ({ one }) => ({
  imovel: one(imoveis, {
    fields: [midiaImovel.imovelId],
    references: [imoveis.id],
  }),
}));
