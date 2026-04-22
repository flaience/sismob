CREATE TYPE "public"."papel_pessoa" AS ENUM('1', '2', '3', '4', '5', '6');--> statement-breakpoint
CREATE TYPE "public"."situacao_titulo" AS ENUM('aberto', 'fechado', 'parcial');--> statement-breakpoint
CREATE TYPE "public"."status_negociacao" AS ENUM('proposta', 'analise', 'contrato', 'concluido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."status_saas" AS ENUM('trial', 'ativo', 'inadimplente', 'suspenso');--> statement-breakpoint
CREATE TYPE "public"."tipo_entidade" AS ENUM('f', 'j');--> statement-breakpoint
CREATE TYPE "public"."tipo_midia" AS ENUM('foto_interna', 'foto_externa', 'foto_360', 'video', 'planta_baixa');--> statement-breakpoint
CREATE TYPE "public"."tipo_mov" AS ENUM('c', 'd');--> statement-breakpoint
CREATE TABLE "ai_conversas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid,
	"contexto" jsonb,
	"last_interaction" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "atributos" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoria_id" integer,
	"nome" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bancos" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo_compe" varchar(10) NOT NULL,
	"nome" varchar(100) NOT NULL,
	CONSTRAINT "bancos_codigo_compe_unique" UNIQUE("codigo_compe")
);
--> statement-breakpoint
CREATE TABLE "base_conhecimento" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"categoria" varchar(50),
	"pergunta_contexto" text,
	"resposta_base" text,
	"tags" text
);
--> statement-breakpoint
CREATE TABLE "caixa" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"grupo_caixa_id" integer,
	"pagamento_id" integer,
	"tipo" "tipo_mov" NOT NULL,
	"valor" numeric(12, 2) NOT NULL,
	"saldo_anterior" numeric(12, 2),
	"saldo_atual" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categorias_atributos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"nome" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contas_bancarias" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"banco_id" integer NOT NULL,
	"apelido" varchar(50) NOT NULL,
	"agencia" varchar(20) NOT NULL,
	"conta" varchar(30) NOT NULL,
	"digito" varchar(10) NOT NULL,
	"pix" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "enderecos" (
	"id" serial PRIMARY KEY NOT NULL,
	"pessoa_id" uuid,
	"cep" varchar(10) NOT NULL,
	"logradouro" varchar(255) NOT NULL,
	"numero" varchar(20) NOT NULL,
	"bairro" varchar(100) NOT NULL,
	"cidade" varchar(100) NOT NULL,
	"estado" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grupo_caixa" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"codigo" varchar(20),
	"descricao" varchar(100) NOT NULL,
	"tipo" "tipo_mov" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imoveis" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"unidade_id" integer,
	"titulo" varchar(255) NOT NULL,
	"descricao" text,
	"tipo" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'disponivel',
	"preco_venda" numeric(12, 2),
	"preco_aluguel" numeric(12, 2),
	"area_privativa" numeric(10, 2),
	"endereco_original" text NOT NULL,
	"video_url" text,
	"lat" numeric(10, 8),
	"lng" numeric(11, 8),
	"proprietario_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "imoveis_atributos" (
	"imovel_id" integer,
	"atributo_id" integer,
	CONSTRAINT "imoveis_atributos_imovel_id_atributo_id_pk" PRIMARY KEY("imovel_id","atributo_id")
);
--> statement-breakpoint
CREATE TABLE "instrucoes_chegada" (
	"id" serial PRIMARY KEY NOT NULL,
	"imovel_id" integer,
	"ordem" integer NOT NULL,
	"titulo" varchar(100) NOT NULL,
	"descricao" text,
	"foto_url" text
);
--> statement-breakpoint
CREATE TABLE "logs_atividades" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid,
	"usuario_id" uuid,
	"operacao" varchar(1) NOT NULL,
	"descricao" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "midias" (
	"id" serial PRIMARY KEY NOT NULL,
	"imovel_id" integer,
	"url" text NOT NULL,
	"tipo" "tipo_midia" DEFAULT 'foto_interna',
	"is_capa" boolean DEFAULT false,
	"ordem" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "mov_negociacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"negociacao_id" integer,
	"usuario_id" uuid,
	"descricao" text NOT NULL,
	"motivo" varchar(50) NOT NULL,
	"data_atual" timestamp DEFAULT now(),
	"data_proximo_contato" timestamp
);
--> statement-breakpoint
CREATE TABLE "negociacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"imovel_id" integer,
	"corretor_id" uuid,
	"cliente_id" uuid,
	"status" "status_negociacao" DEFAULT 'proposta',
	"valor_proposta" numeric(12, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"titulo_id" integer,
	"grupo_caixa_id" integer,
	"valor_pago" numeric(12, 2) NOT NULL,
	"data_pagamento" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pessoas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"unidade_id" integer,
	"tipo" "tipo_entidade" DEFAULT 'f',
	"papel" "papel_pessoa" NOT NULL,
	"nome" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"documento" varchar(20) NOT NULL,
	"telefone" varchar(20),
	"is_admin" boolean DEFAULT false,
	"onboarding_status" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_conta" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"dominio_customizado" varchar(255),
	"status" "status_saas" DEFAULT 'trial',
	"data_vencimento" timestamp,
	"email_financeiro" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"version_schema" varchar(10) DEFAULT '1.0.0',
	"last_migration" timestamp DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_dominio_customizado_unique" UNIQUE("dominio_customizado")
);
--> statement-breakpoint
CREATE TABLE "titulos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"pessoa_id" uuid,
	"conta_bancaria_id" integer,
	"valor_nominal" numeric(12, 2) NOT NULL,
	"tipo" "tipo_mov" NOT NULL,
	"juros" numeric(12, 2) DEFAULT '0',
	"valor_total" numeric(12, 2) NOT NULL,
	"saldo" numeric(12, 2) NOT NULL,
	"data_emissao" timestamp DEFAULT now(),
	"data_vencimento" timestamp NOT NULL,
	"situacao" "situacao_titulo" DEFAULT 'aberto'
);
--> statement-breakpoint
CREATE TABLE "unidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"nome" varchar(255) NOT NULL,
	"cnpj" varchar(20),
	"is_matriz" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "ai_conversas" ADD CONSTRAINT "ai_conversas_pessoa_id_pessoas_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atributos" ADD CONSTRAINT "atributos_categoria_id_categorias_atributos_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_atributos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_grupo_caixa_id_grupo_caixa_id_fk" FOREIGN KEY ("grupo_caixa_id") REFERENCES "public"."grupo_caixa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_pagamento_id_pagamentos_id_fk" FOREIGN KEY ("pagamento_id") REFERENCES "public"."pagamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categorias_atributos" ADD CONSTRAINT "categorias_atributos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_banco_id_bancos_id_fk" FOREIGN KEY ("banco_id") REFERENCES "public"."bancos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_pessoa_id_pessoas_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grupo_caixa" ADD CONSTRAINT "grupo_caixa_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_unidade_id_unidades_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."unidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_proprietario_id_pessoas_id_fk" FOREIGN KEY ("proprietario_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imoveis_atributos" ADD CONSTRAINT "imoveis_atributos_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imoveis_atributos" ADD CONSTRAINT "imoveis_atributos_atributo_id_atributos_id_fk" FOREIGN KEY ("atributo_id") REFERENCES "public"."atributos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instrucoes_chegada" ADD CONSTRAINT "instrucoes_chegada_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs_atividades" ADD CONSTRAINT "logs_atividades_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs_atividades" ADD CONSTRAINT "logs_atividades_usuario_id_pessoas_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midias" ADD CONSTRAINT "midias_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mov_negociacao" ADD CONSTRAINT "mov_negociacao_negociacao_id_negociacoes_id_fk" FOREIGN KEY ("negociacao_id") REFERENCES "public"."negociacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mov_negociacao" ADD CONSTRAINT "mov_negociacao_usuario_id_pessoas_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_imovel_id_imoveis_id_fk" FOREIGN KEY ("imovel_id") REFERENCES "public"."imoveis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_corretor_id_pessoas_id_fk" FOREIGN KEY ("corretor_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negociacoes" ADD CONSTRAINT "negociacoes_cliente_id_pessoas_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_titulo_id_titulos_id_fk" FOREIGN KEY ("titulo_id") REFERENCES "public"."titulos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_grupo_caixa_id_grupo_caixa_id_fk" FOREIGN KEY ("grupo_caixa_id") REFERENCES "public"."grupo_caixa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_unidade_id_unidades_id_fk" FOREIGN KEY ("unidade_id") REFERENCES "public"."unidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_pessoa_id_pessoas_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_conta_bancaria_id_contas_bancarias_id_fk" FOREIGN KEY ("conta_bancaria_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_imoveis_tenant" ON "imoveis" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pessoas_tenant" ON "pessoas" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pessoas_documento" ON "pessoas" USING btree ("documento");