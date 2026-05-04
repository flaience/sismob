const SECAO_ENDERECO = {
  title: "Localização e Endereço",
  fields: [
    { name: "endereco.cep", label: "CEP", type: "text" },
    {
      name: "endereco.logradouro",
      label: "Logradouro",
      type: "text",
      fullWidth: true,
    },
    { name: "endereco.numero", label: "Número", type: "text" },
    { name: "endereco.bairro", label: "Bairro", type: "text" },
    { name: "endereco.cidade", label: "Cidade", type: "text" },
    { name: "endereco.estado", label: "UF (Estado)", type: "text" },
  ],
};

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
          {
            name: "nome",
            label: "Nome / Apelido",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "email", label: "E-mail", type: "text", required: true },
          { name: "telefone", label: "WhatsApp", type: "text" },
          { name: "unidade_id", label: "Unidade Responsável", type: "select" },
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
      { label: "Telefone", key: "telefone" },
    ],
    sections: [
      {
        title: "Identificação do Comprador",
        fields: [
          {
            name: "nome",
            label: "Nome Completo",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
          { name: "email", label: "E-mail", type: "text" },
          { name: "telefone", label: "Telefone", type: "text" },
          {
            name: "tipo",
            label: "Tipo",
            type: "select",
            options: [
              { label: "Física", value: "f" },
              { label: "Jurídica", value: "j" },
            ],
          },
          { name: "unidade_id", label: "Filial", type: "select" },
        ],
      },
      SECAO_ENDERECO,
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
      { label: "Documento", key: "documento" },
    ],
    sections: [
      {
        title: "Dados Pessoais / Jurídicos",
        fields: [
          {
            name: "nome",
            label: "Nome Completo / Razão Social",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "documento",
            label: "CPF / CNPJ",
            type: "text",
            required: true,
          },
          {
            name: "email",
            label: "E-mail de Contrato",
            type: "text",
            required: true,
          },
          { name: "telefone", label: "WhatsApp", type: "text" },
          {
            name: "tipo",
            label: "Personalidade",
            type: "select",
            options: [
              { label: "Física", value: "f" },
              { label: "Jurídica", value: "j" },
            ],
          },
          { name: "unidade_id", label: "Unidade Gestora", type: "select" },
        ],
      },
      SECAO_ENDERECO,
    ],
    aiMetadata:
      "Proprietários precisam de dados validados para que o repasse financeiro e os contratos Gov.br funcionem.",
  },

  inquilinos: {
    title: "Inquilinos",
    entity: "pessoas",
    papel: "4",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "WhatsApp", key: "telefone" },
      { label: "Documento", key: "documento" },
    ],
    sections: [
      {
        title: "Dados do Locatário",
        fields: [
          {
            name: "nome",
            label: "Nome do Inquilino",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
          { name: "email", label: "E-mail", type: "text" },
          { name: "telefone", label: "Telefone", type: "text" },
          { name: "unidade_id", label: "Unidade", type: "select" },
        ],
      },
      SECAO_ENDERECO,
    ],
    aiMetadata:
      "Inquilinos são vinculados a contratos de locação. Verifique pendências financeiras antes de renovar.",
  },

  // --- OPERACIONAL ---

  equipe: {
    title: "Minha Equipe",
    entity: "pessoas",
    papel: "1",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "Cargo", key: "cargo" },
      { label: "E-mail", key: "email" },
    ],
    sections: [
      {
        title: "Dados do Colaborador",
        fields: [
          {
            name: "nome",
            label: "Nome Completo",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "email",
            label: "E-mail (Login)",
            type: "text",
            required: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
          {
            name: "cargo",
            label: "Cargo / Função",
            type: "select",
            options: [
              { label: "Corretor", value: "corretor" },
              { label: "Secretária", value: "secretaria" },
              { label: "Gerente", value: "gerente" },
              { label: "Financeiro", value: "financeiro" },
            ],
          },
          { name: "unidade_id", label: "Filial de Trabalho", type: "select" },
        ],
      },
      SECAO_ENDERECO,
    ],
    aiMetadata:
      "A equipe tem acesso ao sistema. O cargo define quais botões e menus o colaborador poderá ver.",
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
