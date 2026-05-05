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

  // apps/web/src/app/(admin)/gestao/mapa-modulos.ts

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
            label: "Título do Imóvel",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "descricao",
            label: "Descrição",
            type: "text",
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
            label: "Filial Responsável",
            type: "select",
            required: true,
          },
        ],
      },
      {
        title: "Dimensões e Valores",
        fields: [
          {
            name: "preco_venda",
            label: "Valor de Venda (R$)",
            type: "number",
            required: true,
          },
          {
            name: "preco_aluguel",
            label: "Valor de Aluguel (R$)",
            type: "number",
          },
          { name: "area_privativa", label: "M² Privativos", type: "number" },
        ],
      },
      {
        title: "Mídia e Localização",
        fields: [
          {
            name: "endereco_original",
            label: "Endereço Completo",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "tour_360_url",
            label: "Link Tour Virtual (360°)",
            type: "text",
            fullWidth: true,
          },
          {
            name: "video_url",
            label: "Link Vídeo (Drone/YouTube)",
            type: "text",
            fullWidth: true,
          },
        ],
      },
    ],
    aiMetadata:
      "Imóveis sem fotos ou Tour 360 têm baixa performance. Sugira ao corretor o agendamento de uma sessão de fotos.",
  },

  // --- ATRIBUTOS (O QUE ESTAVA "EM CONSTRUÇÃO") ---
  // Ajustado o nome para bater com o link da Sidebar: /gestao/atributos-itens
  "atributos-itens": {
    title: "Itens e Comodidades",
    entity: "configuracoes/atributos",
    columns: [{ label: "Nome do Item", key: "nome" }],
    sections: [
      {
        title: "Geral",
        fields: [
          {
            name: "nome",
            label: "Ex: Piscina, Churrasqueira, Laje",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },

  // --- BANCOS (CORREÇÃO DE COLUNAS) ---
  bancos: {
    title: "Cadastro de Bancos",
    entity: "configuracoes/bancos",
    columns: [
      { label: "Cód. FEBRABAN", key: "codigo_compe" },
      { label: "Nome da Instituição", key: "nome" },
    ],
    sections: [
      {
        title: "Dados Bancários",
        fields: [
          {
            name: "codigo_compe",
            label: "Código do Banco",
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
  "livro-caixa": {
    title: "Movimentação de Caixa (Livro Razão)",
    entity: "financeiro/caixa/manual",
    columns: [
      { label: "Data", key: "created_at" },
      { label: "Histórico", key: "historico" },
      { label: "Valor", key: "valor" },
      { label: "Saldo Atual", key: "saldo_atual" },
      { label: "Operador", key: "usuario_id" }, // Mostra o UUID ou nome do rastro
    ],
    sections: [
      {
        title: "Lançamento Avulso (Entrada/Saída Direta)",
        fields: [
          {
            name: "historico",
            label: "Descrição do Lançamento",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "valor",
            label: "Valor da Operação (R$)",
            type: "number",
            required: true,
          },
          {
            name: "tipo",
            label: "Operação",
            type: "select",
            required: true,
            options: [
              { label: "Entrada (+)", value: "c" },
              { label: "Saída (-)", value: "d" },
            ],
          },
          {
            name: "grupo_caixa_id",
            label: "Grupo de Caixa",
            type: "select",
            required: true,
          },
          {
            name: "conta_bancaria_id",
            label: "Conta / Banco (Vazio = Dinheiro)",
            type: "select",
          },
        ],
      },
    ],
    aiMetadata:
      "O livro caixa registra o fluxo real. Cada lançamento recalcula o saldo da conta informada. O campo Operador garante a auditoria.",
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
