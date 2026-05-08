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

  inquilinos: {
    title: "Gestão de Inquilinos",
    entity: "pessoas",
    papel: "4",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "WhatsApp", key: "telefone" },
    ],
    sections: [
      {
        title: "Dados Básicos",
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
        ],
      },
      SECAO_ENDERECO, // O Reuso que já criamos
    ],
  },

  // --- OPERACIONAL ---
  imoveis: {
    title: "Gestão de Imóveis",
    entity: "imoveis",
    columns: [
      { label: "Título", key: "titulo" },
      { label: "Preço", key: "preco_venda" },
      { label: "Status", key: "status" },
    ],
    sections: [
      {
        title: "Galeria de Mídias",
        fields: [
          {
            name: "midias",
            label: "Fotos do Imóvel (Marque as 360° e a Capa no atalho)",
            type: "gallery",
          },
          {
            name: "video_url",
            label: "Link Externo de Vídeo (YouTube)",
            type: "text",
            fullWidth: true,
          },
        ],
      },
      {
        title: "Anúncio",
        fields: [
          {
            name: "titulo",
            label: "Título do Anúncio",
            type: "text",
            required: true,
            fullWidth: true,
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
        title: "Endereço do Imóvel",
        fields: [
          {
            name: "endereco_original",
            label: "Endereço Completo (Rua, Nº, Bairro, Cidade)",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
      {
        title: "Acessórios e Lazer (Atributos)",
        fields: [
          // Campo novo: checklist automático de atributos do banco
          {
            name: "atributos",
            label: "Marque o que o imóvel possui",
            type: "checklist",
            entity: "atributos",
          },
        ],
      },
      {
        title: "Mídia e Fotos",
        fields: [
          // Campo novo: Gerenciador de Galeria com flag 360
          { name: "midias", label: "Fotos e Vídeos", type: "gallery" },
        ],
      },
    ],
  },

  atributos: {
    title: "Itens e Comodidades",
    entity: "configuracoes/atributos",
    columns: [{ label: "Item", key: "nome" }],
    sections: [
      {
        title: "Cadastro de Acessório",
        fields: [
          {
            name: "nome",
            label: "Ex: Piscina, Laje, Churrasqueira",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },
  "atributos-itens": {
    title: "Itens e Comodidades",
    entity: "configuracoes/atributos",
    columns: [{ label: "Descrição do Item", key: "nome" }],
    sections: [
      {
        title: "Cadastro de Acessório",
        fields: [
          {
            name: "nome",
            label: "Ex: Piscina, Churrasqueira",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },
  // --- FINANCEIRO ---
  "contas-bancarias": {
    title: "Minhas Contas Bancárias",
    entity: "configuracoes/contas-bancarias",
    columns: [
      { label: "Banco", key: "banco_nome" },
      { label: "Agência", key: "agencia" },
      { label: "Conta", key: "conta" },
    ],
    sections: [
      {
        title: "Dados da Conta",
        fields: [
          {
            name: "banco_nome",
            label: "Nome do Banco (Ex: Itaú)",
            type: "text",
            required: true,
          },
          { name: "codigo_bacen", label: "Cód. BACEN", type: "text" },
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

  // apps/web/src/app/(admin)/gestao/mapa-modulos.ts

  imobiliarias: {
    title: "Minhas Imobiliárias",
    entity: "saas/onboarding",
    columns: [
      { label: "Fantasia", key: "nome_fantasia" },
      { label: "Slug", key: "slug" },
      { label: "Cidade", key: "endereco.cidade" }, // Agora podemos mostrar a cidade no grid
    ],
    sections: [
      {
        title: "Identidade Visual e Marca",
        fields: [
          {
            name: "nome_fantasia",
            label: "Nome Fantasia (Aparece no Topo)",
            type: "text",
            required: true,
          },
          // MUDANÇA: Agora usa o atalho de carregar imagem
          {
            name: "url_logo",
            label: "Logomarca da Imobiliária",
            type: "image",
            fullWidth: true,
          },
          {
            name: "nome_conta",
            label: "Razão Social",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
      {
        title: "Contato e Acesso",
        fields: [
          {
            name: "slug",
            label: "Slug (Link único do site)",
            type: "text",
            required: true,
          },
          {
            name: "email_financeiro",
            label: "E-mail de Cobrança",
            type: "text",
            required: true,
          },
          { name: "telefone", label: "Telefone de Suporte", type: "text" },
        ],
      },
      // INCLUSÃO: Agora a imobiliária também recebe endereço completo
      SECAO_ENDERECO,
    ],
  },
};
