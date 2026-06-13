# Sismob - Industrial Real Estate Engine v2.0

O Sismob é uma plataforma SaaS multi-tenant de alta performance para gestão imobiliária 360°, focado em agilidade operacional e inteligência de vendas.

## 🚀 Arquitetura Monorepo

- **apps/api**: Backend NestJS de alta densidade.
- **apps/web**: Frontend Next.js 15 (Luxury UX).
- **packages/database**: Contrato de dados centralizado via Drizzle ORM.

## 🛠 Tech Stack

- **Frameworks**: Next.js 15, NestJS 11.
- **Banco de Dados**: PostgreSQL (Supabase).
- **ORM**: Drizzle ORM.
- **Autenticação**: Supabase Auth (SSR).
- **IA**: n8n + Model Context Protocol (MCP).

## 📥 Instalação

````bash
pnpm install
pnpm turbo build
pnpm dev

---

### 2. `docs/architecture.md` (Arquitetura Técnica)
```markdown
# Arquitetura de Sistemas

## 🏗 Estrutura de Camadas
O Sismob utiliza um modelo de **Monorepo Gerenciado (Turborepo)** para garantir que o DNA dos dados (Schema) seja o mesmo no Web, Mobile e API.

### Fluxo de Dados
1. **Identificação (TenantContext)**: O sistema identifica a imobiliária pelo hostname.
2. **Autenticação (AuthContext)**: O Supabase valida o login e o NestJS injeta os dados de Papel e Cargo.
3. **Motor Genérico (GenericConfig)**: As 22 telas de configuração são geradas dinamicamente via mapa de metadados.

## 🔒 Segurança e RBAC
A hierarquia de poder é dividida em Papéis (Roles):
- **Nível 0 (Super-Admin)**: Luis (Flaience) - Poder total sobre o SaaS.
- **Nível 6 (Dono)**: Cliente pagador - Admin total da sua instância.
- **Nível 1 (Equipe)**: Funcionários - Acesso restrito por Cargo (Gerente, Financeiro, Corretor).
````
