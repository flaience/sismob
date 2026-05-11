ALTER TYPE "public"."papel_pessoa" ADD VALUE '7';--> statement-breakpoint
ALTER TABLE "bancos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pagamentos" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "bancos" CASCADE;--> statement-breakpoint
DROP TABLE "pagamentos" CASCADE;--> statement-breakpoint
ALTER TABLE "atributos" DROP CONSTRAINT "atributos_categoria_id_categorias_atributos_id_fk";
--> statement-breakpoint
ALTER TABLE "caixa" DROP CONSTRAINT "caixa_pagamento_id_pagamentos_id_fk";
--> statement-breakpoint
ALTER TABLE "contas_bancarias" DROP CONSTRAINT "contas_bancarias_banco_id_bancos_id_fk";
--> statement-breakpoint
DROP INDEX "idx_imoveis_tenant";--> statement-breakpoint
ALTER TABLE "atributos" ADD COLUMN "tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "atributos" ADD COLUMN "quantidade" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "caixa" ADD COLUMN "titulo_id" integer;--> statement-breakpoint
ALTER TABLE "caixa" ADD COLUMN "conta_bancaria_id" integer;--> statement-breakpoint
ALTER TABLE "caixa" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "caixa" ADD COLUMN "historico" text;--> statement-breakpoint
ALTER TABLE "contas_bancarias" ADD COLUMN "banco_nome" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "contas_bancarias" ADD COLUMN "codigo_bacen" varchar(10);--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "cep" varchar(10);--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "logradouro" varchar(255);--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "numero" varchar(20);--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "bairro" varchar(100);--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "cidade" varchar(100);--> statement-breakpoint
ALTER TABLE "imoveis" ADD COLUMN "estado" varchar(2);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "nome_fantasia" varchar(255);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "telefone" varchar(20);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "url_logo" text;--> statement-breakpoint
ALTER TABLE "titulos" ADD COLUMN "usuario_id" uuid;--> statement-breakpoint
ALTER TABLE "titulos" ADD COLUMN "data_pagamento" timestamp;--> statement-breakpoint
ALTER TABLE "titulos" ADD COLUMN "forma_pagamento" varchar(50);--> statement-breakpoint
ALTER TABLE "atributos" ADD CONSTRAINT "atributos_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atributos" ADD CONSTRAINT "atributos_categoria_id_categorias_atributos_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias_atributos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_titulo_id_titulos_id_fk" FOREIGN KEY ("titulo_id") REFERENCES "public"."titulos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_conta_bancaria_id_contas_bancarias_id_fk" FOREIGN KEY ("conta_bancaria_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" ADD CONSTRAINT "caixa_usuario_id_pessoas_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_usuario_id_pessoas_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."pessoas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa" DROP COLUMN "pagamento_id";--> statement-breakpoint
ALTER TABLE "contas_bancarias" DROP COLUMN "banco_id";--> statement-breakpoint
ALTER TABLE "contas_bancarias" DROP COLUMN "apelido";--> statement-breakpoint
ALTER TABLE "imoveis" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "imoveis" DROP COLUMN "endereco_original";--> statement-breakpoint
ALTER TABLE "imoveis" DROP COLUMN "lat";--> statement-breakpoint
ALTER TABLE "imoveis" DROP COLUMN "lng";--> statement-breakpoint
ALTER TABLE "titulos" DROP COLUMN "saldo";