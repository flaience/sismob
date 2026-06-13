# Relacionamento de Dados (ERD)

## Principais Entidades

### Gestão SaaS

- `tenants`: Contas das imobiliárias.
- `unidades`: Filiais físicas de cada tenant.

### CRM

- `pessoas`: Entidade única para todos os atores do sistema.
  - _Papéis_: 1-Equipe, 2-Lead, 3-Proprietário, 4-Inquilino, 7-Comprador.

### Imóveis

- `imoveis`: O ativo principal.
- `midias`: Galeria de fotos, vídeos e tour 360°.
- `atributos`: Cardápio de comodidades (3x Quartos, 2x Vagas).
- `imoveis_atributos`: Tabela de ligação N:N.

### Financeiro

- `titulos`: Contas a pagar e receber.
- `caixa`: Livro razão dinâmico com cálculo de saldo por banco ou espécie.
