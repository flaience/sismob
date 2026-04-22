"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imoveisRelations =
  exports.midiaImovel =
  exports.instrucoesChegada =
  exports.inventario =
  exports.infraestrutura =
  exports.imoveis =
  exports.statusImovelEnum =
  exports.tipoImovelEnum =
    void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.tipoImovelEnum = (0, pg_core_1.pgEnum)("tipo_imovel", [
  "casa",
  "apartamento",
  "terreno",
  "comercial",
  "cobertura",
]);
exports.statusImovelEnum = (0, pg_core_1.pgEnum)("status_imovel", [
  "disponivel",
  "reservado",
  "vendido",
  "alugado",
]);
exports.imoveis = (0, pg_core_1.pgTable)("imoveis", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  titulo: (0, pg_core_1.varchar)("titulo", { length: 255 }).notNull(),
  descricao: (0, pg_core_1.text)("descricao"),
  tipo: (0, exports.tipoImovelEnum)("tipo").notNull(),
  status: (0, exports.statusImovelEnum)("status").default("disponivel"),
  precoVenda: (0, pg_core_1.decimal)("preco_venda", {
    precision: 12,
    scale: 2,
  }),
  precoAluguel: (0, pg_core_1.decimal)("preco_aluguel", {
    precision: 12,
    scale: 2,
  }),
  valorIptu: (0, pg_core_1.decimal)("valor_iptu", { precision: 10, scale: 2 }),
  valorCondominio: (0, pg_core_1.decimal)("valor_condominio", {
    precision: 10,
    scale: 2,
  }),
  areaPrivativa: (0, pg_core_1.decimal)("area_privativa", {
    precision: 10,
    scale: 2,
  }).notNull(),
  areaTotal: (0, pg_core_1.decimal)("area_total", { precision: 10, scale: 2 }),
  quartos: (0, pg_core_1.integer)("quartos").default(0),
  suites: (0, pg_core_1.integer)("suites").default(0),
  banheiros: (0, pg_core_1.integer)("banheiros").default(0),
  vagasGaragem: (0, pg_core_1.integer)("vagas_garagem").default(0),
  endereco: (0, pg_core_1.text)("endereco").notNull(),
  bairro: (0, pg_core_1.varchar)("bairro", { length: 100 }),
  cidade: (0, pg_core_1.varchar)("cidade", { length: 100 }),
  estado: (0, pg_core_1.varchar)("estado", { length: 2 }),
  lat: (0, pg_core_1.decimal)("lat", { precision: 10, scale: 8 }).notNull(),
  lng: (0, pg_core_1.decimal)("lng", { precision: 11, scale: 8 }).notNull(),
  tourVirtualUrl: (0, pg_core_1.text)("tour_virtual_url"),
  videoApresentacaoUrl: (0, pg_core_1.text)("video_url"),
  createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
  updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.infraestrutura = (0, pg_core_1.pgTable)("infraestrutura", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  imovelId: (0, pg_core_1.integer)("imovel_id").references(
    () => exports.imoveis.id,
    {
      onDelete: "cascade",
    },
  ),
  temAguaQuente: (0, pg_core_1.boolean)("tem_agua_quente").default(false),
  temEsperaSplit: (0, pg_core_1.boolean)("tem_espera_split").default(false),
  temGasCentral: (0, pg_core_1.boolean)("tem_gas_central").default(false),
  temChurrasqueira: (0, pg_core_1.boolean)("tem_churrasqueira").default(false),
  temLareira: (0, pg_core_1.boolean)("tem_lareira").default(false),
  temPiscina: (0, pg_core_1.boolean)("tem_piscina").default(false),
  permitePets: (0, pg_core_1.boolean)("permite_pets").default(true),
  mobiliado: (0, pg_core_1.boolean)("mobiliado").default(false),
});
exports.inventario = (0, pg_core_1.pgTable)("inventario", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  imovelId: (0, pg_core_1.integer)("imovel_id").references(
    () => exports.imoveis.id,
    {
      onDelete: "cascade",
    },
  ),
  item: (0, pg_core_1.varchar)("item", { length: 100 }).notNull(),
  quantidade: (0, pg_core_1.integer)("quantidade").default(1),
  estadoConservacao: (0, pg_core_1.varchar)("estado", { length: 50 }),
});
exports.instrucoesChegada = (0, pg_core_1.pgTable)("instrucoes_chegada", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  imovelId: (0, pg_core_1.integer)("imovel_id").references(
    () => exports.imoveis.id,
    {
      onDelete: "cascade",
    },
  ),
  ordem: (0, pg_core_1.integer)("ordem").notNull(),
  titulo: (0, pg_core_1.varchar)("titulo", { length: 100 }).notNull(),
  descricao: (0, pg_core_1.text)("descricao"),
  fotoUrl: (0, pg_core_1.text)("foto_url"),
  latAlvo: (0, pg_core_1.decimal)("lat_alvo", { precision: 10, scale: 8 }),
  lngAlvo: (0, pg_core_1.decimal)("lng_alvo", { precision: 11, scale: 8 }),
});
exports.midiaImovel = (0, pg_core_1.pgTable)("midia_imovel", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  imovelId: (0, pg_core_1.integer)("imovel_id").references(
    () => exports.imoveis.id,
    {
      onDelete: "cascade",
    },
  ),
  url: (0, pg_core_1.text)("url").notNull(),
  tipo: (0, pg_core_1.varchar)("tipo", { length: 20 }).$type().default("foto"),
  ordem: (0, pg_core_1.integer)("ordem").default(0),
});
exports.imoveisRelations = (0, drizzle_orm_1.relations)(
  exports.imoveis,
  ({ one, many }) => ({
    infraestrutura: one(exports.infraestrutura, {
      fields: [exports.imoveis.id],
      references: [exports.infraestrutura.imovelId],
    }),
    inventario: many(exports.inventario),
    instrucoes: many(exports.instrucoesChegada),
    midias: many(exports.midiaImovel),
  }),
);
//# sourceMappingURL=schema.js.map
// --- TEMPLATES DE CONTRATOS (Diferencial de Produto) ---
export const templatesContratos = pgTable("templates_contratos", {
  id: serial("id").primaryKey(),
  tenant_id: uuid("tenant_id").references(() => tenants.id), // Se for NULL, é um template global da Flaience
  titulo: varchar("titulo", { length: 255 }).notNull(), // Ex: "Compra e Venda Padrão"
  conteudo: text("conteudo").notNull(), // O texto com as variáveis {{variavel}}
  tipo: varchar("tipo", { length: 50 }), // 'saas', 'venda', 'locacao'
});

// --- CONTRATOS GERADOS ---
export const contratosGerados = pgTable("contratos_gerados", {
  id: uuid("id").defaultRandom().primaryKey(),
  template_id: integer("template_id").references(() => templatesContratos.id),
  entidade_id: uuid("entidade_id"), // ID da Pessoa ou Imóvel relacionado
  url_pdf: text("url_pdf"),
  status: varchar("status", { length: 20 }).default("rascunho"), // rascunho, assinado
  created_at: timestamp("created_at").defaultNow(),
});

// --- 1. COFRE DE CONTRATOS (STORAGE METADATA) ---
export const contratosDocumentos = pgTable("contratos_documentos", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id").references(() => tenants.id),
  negociacao_id: integer("negociacao_id").references(() => negociacoes.id),

  nome_arquivo: varchar("nome_arquivo", { length: 255 }).notNull(),
  url_storage: text("url_storage").notNull(), // Link no Supabase Storage

  // Status do Ciclo de Vida
  status: varchar("status", { length: 20 }).default("aguardando_assinatura"), // 'rascunho', 'assinado', 'validado'

  // Rastreabilidade Gov.br
  hash_integridade: text("hash_integridade"), // SHA-256 do arquivo original
  data_assinatura: timestamp("data_assinatura"),
  assinantes: jsonb("assinantes"), // [{nome: "Luis", cpf: "123", data: "..."}]

  created_at: timestamp("created_at").defaultNow(),
});
