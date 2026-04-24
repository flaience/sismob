export const PAPEIS = {
  EQUIPE: "1", // Corretores, Secretárias, Admin
  INTERESSADO: "2", // Leads (Só Nome/Whats/Email) - O "frio"
  PROPRIETARIO: "3", // Donos dos imóveis
  INQUILINO: "4", // Quem já mora (Locação ativa)
  IMOBILIARIA: "5", // A empresa (Unidade/Filial)
  CONTA_SAAS: "6", // O cliente da Flaience (Financeiro)
  CLIENTE_COMPRADOR: "7", // O cara da Negociação/Contrato - O "quente"
};

export const PAPEIS_LABELS = {
  [PAPEIS.EQUIPE]: "Colaborador",
  [PAPEIS.INTERESSADO]: "Interessado",
  [PAPEIS.PROPRIETARIO]: "Proprietário",
  [PAPEIS.INQUILINO]: "Inquilino",
  [PAPEIS.IMOBILIARIA]: "Imobiliária",
  [PAPEIS.CONTA_SAAS]: "Assinante SaaS",
  [PAPEIS.CLIENTE_COMPRADOR]: "Cliente Comprador",
};
