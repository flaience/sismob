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
      { label: "WhatsApp", key: "telefone" },
    ],
    sections: [
      {
        title: "Dados do Lead",
        fields: [
          {
            name: "nome",
            label: "Nome",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "email", label: "E-mail", type: "text", required: true },
          { name: "telefone", label: "WhatsApp", type: "text" },
          { name: "unidade_id", label: "Unidade", type: "select" },
        ],
      },
    ],
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
            label: "Nome",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
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
        title: "Identificação",
        fields: [
          {
            name: "nome",
            label: "Nome",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "documento",
            label: "CPF/CNPJ",
            type: "text",
            required: true,
          },
          {
            name: "tipo",
            label: "Personalidade",
            type: "select",
            options: [
              { label: "Física", value: "f" },
              { label: "Jurídica", value: "j" },
            ],
          },
          { name: "unidade_id", label: "Unidade", type: "select" },
        ],
      },
      SECAO_ENDERECO,
    ],
  },

  // --- OPERACIONAL ---
  imoveis: {
    title: "Estoque de Imóveis",
    entity: "imoveis",
    columns: [
      { label: "Título", key: "titulo" },
      { label: "Tipo", key: "tipo" },
      { label: "Preço", key: "preco_venda" },
    ],
    sections: [
      {
        title: "Dados do Anúncio",
        fields: [
          {
            name: "titulo",
            label: "Título",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "tipo",
            label: "Tipo",
            type: "select",
            required: true,
            options: [
              { label: "Casa", value: "casa" },
              { label: "Apartamento", value: "apto" },
              { label: "Terreno", value: "terreno" },
            ],
          },
          {
            name: "proprietario_id",
            label: "Proprietário",
            type: "select",
            required: true,
          },
          {
            name: "unidade_id",
            label: "Filial",
            type: "select",
            required: true,
          },
        ],
      },
      {
        title: "Valores",
        fields: [
          {
            name: "preco_venda",
            label: "Venda (R$)",
            type: "number",
            required: true,
          },
          { name: "preco_aluguel", label: "Aluguel (R$)", type: "number" },
        ],
      },
      {
        title: "Mídia",
        fields: [
          {
            name: "tour_360_url",
            label: "Tour 360",
            type: "text",
            fullWidth: true,
          },
          {
            name: "video_url",
            label: "Vídeo Drone",
            type: "text",
            fullWidth: true,
          },
        ],
      },
    ],
  },

  // --- FINANCEIRO ---
  bancos: {
    title: "Bancos (Instituições)",
    entity: "configuracoes/bancos",
    columns: [
      { label: "Código", key: "codigo_compe" },
      { label: "Nome", key: "nome" },
    ],
    sections: [
      {
        title: "Dados BACEN",
        fields: [
          {
            name: "codigo_compe",
            label: "Código BACEN",
            type: "text",
            required: true,
          },
          {
            name: "nome",
            label: "Nome do Banco",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },

  "contas-bancarias": {
    title: "Nossas Contas Bancárias",
    entity: "configuracoes/contas-bancarias",
    columns: [
      { label: "Apelido", key: "apelido" },
      { label: "Agência", key: "agencia" },
      { label: "Conta", key: "conta" },
    ],
    sections: [
      {
        title: "Dados da Conta",
        fields: [
          {
            name: "apelido",
            label: "Apelido (Ex: Itaú Aluguéis)",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "banco_id", label: "Banco", type: "select", required: true },
          { name: "agencia", label: "Agência", type: "text", required: true },
          {
            name: "conta",
            label: "Número da Conta",
            type: "text",
            required: true,
          },
          { name: "digito", label: "Dígito", type: "text", required: true },
          { name: "pix", label: "Chave PIX", type: "text", fullWidth: true },
        ],
      },
    ],
  },

  titulos: {
    title: "Contas a Pagar / Receber",
    entity: "financeiro/titulos",
    columns: [
      { label: "Vencimento", key: "data_vencimento" },
      { label: "Valor Total", key: "valor_total" },
      { label: "Situação", key: "situacao" },
    ],
    sections: [
      {
        title: "Dados do Título",
        fields: [
          {
            name: "pessoa_id",
            label: "Cliente/Proprietário",
            type: "select",
            required: true,
            fullWidth: true,
          },
          {
            name: "tipomov",
            label: "Tipo",
            type: "select",
            required: true,
            options: [
              { label: "Entrada", value: "c" },
              { label: "Saída", value: "d" },
            ],
          },
          {
            name: "valor_nominal",
            label: "Valor Nominal",
            type: "number",
            required: true,
          },
          {
            name: "data_vencimento",
            label: "Vencimento",
            type: "date",
            required: true,
          },
        ],
      },
      {
        title: "Ajustes",
        fields: [
          { name: "juros", label: "Juros (R$)", type: "number" },
          {
            name: "valor_total",
            label: "Valor Líquido",
            type: "number",
            required: true,
          },
          { name: "conta_bancaria_id", label: "Banco", type: "select" },
        ],
      },
    ],
  },

  "livro-caixa": {
    title: "Movimentação de Caixa",
    entity: "financeiro/caixa",
    columns: [
      { label: "Data", key: "created_at" },
      { label: "Histórico", key: "historico" },
      { label: "Saldo", key: "saldo_atual" },
    ],
    sections: [
      {
        title: "Lançamento Manual",
        fields: [
          {
            name: "historico",
            label: "Descrição",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "valor", label: "Valor", type: "number", required: true },
          {
            name: "tipo",
            label: "Tipo",
            type: "select",
            options: [
              { label: "Entrada", value: "c" },
              { label: "Saída", value: "d" },
            ],
          },
          {
            name: "conta_bancaria_id",
            label: "Banco (Vazio = Dinheiro)",
            type: "select",
          },
        ],
      },
    ],
  },

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
          { name: "descricao", label: "Nome", type: "text", required: true },
          {
            name: "tipo",
            label: "Natureza (C/D)",
            type: "select",
            options: [
              { label: "Crédito", value: "c" },
              { label: "Débito", value: "d" },
            ],
          },
        ],
      },
    ],
  },

  unidades: {
    title: "Unidades / Filiais",
    entity: "configuracoes/unidades",
    columns: [{ label: "Nome", key: "nome" }],
    sections: [
      {
        title: "Dados Unidade",
        fields: [
          {
            name: "nome",
            label: "Nome da Filial",
            type: "text",
            required: true,
          },
        ],
      },
    ],
  },

  imobiliarias: {
    title: "Fábrica de Clientes (Tenants)",
    entity: "saas/onboarding",
    columns: [
      { label: "Empresa", key: "nome_conta" },
      { label: "Slug", key: "slug" },
    ],
    sections: [
      {
        title: "Nova Imobiliária",
        fields: [
          { name: "nomeEmpresa", label: "Nome", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
        ],
      },
    ],
  },
};
