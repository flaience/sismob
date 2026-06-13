# Domínio e Regras de Negócio

## 🏢 O Conceito de Tenant

. A Tabela tenants (A Empresa / A Instância)
O que é: É o registro organizacional da imobiliária.

- Função:

  . Um `Tenant` que representa uma Imobiliária. Ele é o dono de todos os dados (Imóveis, Pessoas, Caixa). O isolamento é
  garantido pela coluna `tenant_id` em todas as tabelas.

  . É o "balde" que guarda todos os dados. O tenant_id é o que garante que a Imobiliária A nunca veja os imóveis
  da Imobiliária B:

.. Por que precisamos das duas? (O Cenário Industrial)
Imagine que a "Imobiliária Silva" (Tenant) cresça e tenha dois sócios.
Você terá UM registro na tabela tenants (Imobiliária Silva).
Você terá DOIS registros na tabela pessoas com papel: '6' (Sócio A e Sócio B).
Ambos mandam em tudo na Imobiliária Silva, mas são pessoas diferentes com logins diferentes.

- Campos: Nome Fantasia, CNPJ, Slug (link do site), Email de Faturamento.
- No mundo real: É o CNPJ da empresa que assina o contrato com a Flaience.

2. A Tabela pessoas com papel: '6' (O Gestor / O Usuário Mestre)
   O que é: É o ser humano que é dono dessa imobiliária.
   Função: É o usuário que tem a "Chave Mestra" dentro daquela imobiliária. Ele é quem faz login, tem uma senha e pode cadastrar corretores.
   Campos: Nome (ex: Sr. Ricardo), CPF, E-mail de Login, Senha.
   No mundo real: É a pessoa física com quem o Luis conversa para dar o suporte.

## 📍 Modelo de Endereço Lego

Para garantir flexibilidade industrial, o endereço foi desacoplado das entidades.

- Existe uma tabela única `enderecos` (O Bloco de Lego).
- `Tenants`, `Pessoas` e `Imoveis` possuem uma coluna `endereco_id`.
- Vantagem: Permite múltiplos endereços (ex: Cobrança vs Residencial) sem duplicar código.

## ⚖️ Negociação Progressiva

A venda não é um cadastro estático, mas um processo evolutivo:

1. **Match**: Vinculo rápido entre Interessado e Imóvel.
2. **Proposta**: Definição de valores e intensidade.
3. **Fechamento**: Motor de faturamento automático baseado no JSONB de Composição de Verbas.
