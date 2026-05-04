export const MAPA_SISMOB: any = {
  // --- CRM COMERCIAL ---
  leads: {
    title: "Interessados (Leads)",
    entity: "pessoas",
    papel: "2",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "E-mail", key: "email" },
      { label: "WhatsApp", key: "telefone" },
    ],
    sections: [
      {
        title: "Dados do Lead",
        fields: [
          { name: "nome", label: "Nome", type: "text", required: true },
          { name: "email", label: "E-mail", type: "text" },
          { name: "telefone", label: "WhatsApp", type: "text" },
        ],
      },
    ],
    aiMetadata:
      "Leads são contatos iniciais. O foco do Agente deve ser a primeira qualificação por voz.",
  },
  compradores: {
    title: "Clientes Compradores",
    entity: "pessoas",
    papel: "7",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "Documento", key: "documento" },
    ],
    sections: [
      {
        title: "Identificação",
        fields: [
          {
            name: "nome",
            label: "Nome Completo",
            type: "text",
            required: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
        ],
      },
    ],
    aiMetadata:
      "Clientes quentes em fase de fechamento. Exigem preenchimento total para o motor de contratos.",
  },
  proprietarios: {
    title: "Proprietários",
    entity: "pessoas",
    papel: "3",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "WhatsApp", key: "telefone" },
    ],
    sections: [
      {
        title: "Dados Pessoais",
        fields: [
          { name: "nome", label: "Nome/Razão", type: "text", required: true },
          { name: "documento", label: "CPF/CNPJ", type: "text" },
        ],
      },
    ],
  },
  inquilinos: {
    title: "Inquilinos",
    entity: "pessoas",
    papel: "4",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "WhatsApp", key: "telefone" },
    ],
    sections: [
      {
        title: "Dados do Locatário",
        fields: [{ name: "nome", label: "Nome", type: "text", required: true }],
      },
    ],
    aiMetadata:
      "Inquilinos são vinculados a contratos de locação. Verifique pendências antes de renovar.",
  },

  // --- OPERACIONAL ---
  equipe: {
    title: "Minha Equipe",
    entity: "pessoas",
    papel: "1",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "Cargo", key: "cargo" },
    ],
    sections: [
      {
        title: "Colaborador",
        fields: [
          { name: "nome", label: "Nome", type: "text" },
          { name: "cargo", label: "Cargo", type: "select" },
        ],
      },
    ],
  },
  imoveis: {
    title: "Estoque de Imóveis",
    entity: "imoveis",
    columns: [
      { label: "Título", key: "titulo" },
      { label: "Preço", key: "preco_venda" },
    ],
    sections: [
      {
        title: "Anúncio",
        fields: [
          { name: "titulo", label: "Título", type: "text", fullWidth: true },
          { name: "preco_venda", label: "Preço", type: "number" },
        ],
      },
      {
        title: "Mídia Imersiva",
        fields: [
          { name: "tour_360_url", label: "Link Tour 360", type: "text" },
        ],
      },
    ],
  },

  // --- FINANCEIRO ---
  "grupos-caixa": {
    title: "Plano de Contas",
    entity: "configuracoes/grupos-caixa",
    columns: [
      { label: "Descrição", key: "descricao" },
      { label: "Tipo", key: "tipo" },
    ],
    sections: [
      {
        title: "Grupo Contábil",
        fields: [
          { name: "descricao", label: "Nome", type: "text" },
          { name: "tipo", label: "C/D", type: "select" },
        ],
      },
    ],
    aiMetadata:
      "Grupos organizam o faturamento. O Agente MCP usa isso para gerar o DRE.",
  },
  "contas-bancarias": {
    title: "Contas Bancárias",
    entity: "configuracoes/contas-bancarias",
    columns: [
      { label: "Apelido", key: "apelido" },
      { label: "Banco", key: "banco_id" },
    ],
    sections: [
      {
        title: "Conta",
        fields: [{ name: "apelido", label: "Apelido", type: "text" }],
      },
    ],
  },

  // --- CONFIGURAÇÕES ---
  unidades: {
    title: "Unidades / Filiais",
    entity: "configuracoes/unidades",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "Cidade", key: "cidade" },
    ],
    sections: [
      {
        title: "Dados Unidade",
        fields: [{ name: "nome", label: "Nome da Filial", type: "text" }],
      },
    ],
  },
  bancos: {
    title: "Bancos",
    entity: "configuracoes/bancos",
    columns: [
      { label: "Código", key: "codigo_compe" },
      { label: "Nome", key: "nome" },
    ],
    sections: [
      {
        title: "Instituição",
        fields: [
          { name: "nome", label: "Nome do Banco", type: "text" },
          { name: "codigo_compe", label: "Código", type: "text" },
        ],
      },
    ],
  },
  imobiliarias: {
    title: "Fábrica de Clientes",
    entity: "saas/onboarding",
    columns: [
      { label: "Empresa", key: "nome_conta" },
      { label: "Status", key: "status" },
    ],
    sections: [
      {
        title: "Onboarding",
        fields: [{ name: "nomeEmpresa", label: "Imobiliária", type: "text" }],
      },
    ],
  },
  onboarding: {
    title: "Nova Imobiliária",
    entity: "saas/onboarding",
    sections: [
      {
        title: "Faturamento",
        fields: [
          {
            name: "nomeEmpresa",
            label: "Nome da Empresa",
            type: "text",
            required: true,
          },
          { name: "slug", label: "Slug/Link", type: "text", required: true },
          {
            name: "email_financeiro",
            label: "E-mail Cobrança",
            type: "text",
            required: true,
          },
        ],
      },
      {
        title: "Responsável",
        fields: [
          {
            name: "nomeDono",
            label: "Nome do Dono",
            type: "text",
            required: true,
          },
          {
            name: "email",
            label: "E-mail de Login",
            type: "text",
            required: true,
          },
          {
            name: "documento",
            label: "CPF do Dono",
            type: "text",
            required: true,
          },
        ],
      },
    ],
  },
};
