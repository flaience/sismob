//src/app/(admin)/gestao/mapa-modulos.ts
export const MAPA_MODULOS = {
  bancos: {
    title: "Bancos",
    entity: "bancos",
    fields: [
      { name: "nome", label: "Nome", type: "text" },
      { name: "codigo_compe", label: "Código", type: "text" },
    ],
  },
  leads: {
    title: "Interessados (Leads)",
    entity: "pessoas",
    papel: "2",
    sections: [
      {
        title: "Dados do Lead",
        fields: [
          {
            name: "nome",
            label: "Nome / Apelido",
            type: "text",
            fullWidth: true,
          },
          { name: "email", label: "E-mail", type: "text" },
          { name: "telefone", label: "WhatsApp", type: "text" },
        ],
      },
    ],
  },

  // 2. CRM - PROPRIETÁRIOS (PRECISA DE DADOS COMPLETOS)
  proprietarios: {
    title: "Proprietários",
    entity: "pessoas",
    papel: "3",
    sections: [
      {
        title: "Dados Pessoais",
        fields: [
          {
            name: "nome",
            label: "Nome Completo / Razão",
            type: "text",
            fullWidth: true,
          },
          { name: "documento", label: "CPF / CNPJ", type: "text" },
          { name: "email", label: "E-mail", type: "text" },
          { name: "unidade_id", label: "Vincular à Unidade", type: "select" },
        ],
      },
      {
        title: "Endereço de Contrato",
        fields: [
          { name: "cep", label: "CEP", type: "text" },
          {
            name: "logradouro",
            label: "Endereço",
            type: "text",
            fullWidth: true,
          },
          { name: "cidade", label: "Cidade", type: "text" },
        ],
      },
    ],
  },

  // 3. IMÓVEIS (A JÓIA DA COROA)
  imoveis: {
    title: "Gestão de Imóveis",
    entity: "imoveis",
    sections: [
      {
        title: "Anúncio e Valor",
        fields: [
          {
            name: "titulo",
            label: "Título do Imóvel",
            type: "text",
            fullWidth: true,
          },
          {
            name: "tipo",
            label: "Tipo",
            type: "select",
            options: [
              { label: "Casa", value: "casa" },
              { label: "Apartamento", value: "apto" },
            ],
          },
          { name: "preco_venda", label: "Valor de Venda", type: "number" },
        ],
      },
      {
        title: "Diferenciais e 360",
        fields: [
          {
            name: "tour_360_url",
            label: "Link Tour Virtual",
            type: "text",
            fullWidth: true,
          },
          {
            name: "video_url",
            label: "Link Vídeo Drone/YouTube",
            type: "text",
            fullWidth: true,
          },
        ],
      },
    ],
  },
  // Adicione dentro do export const MAPA_SISMOB = { ... }

  // 4. CRM - INQUILINOS
  inquilinos: {
    title: "Gestão de Inquilinos",
    entity: "pessoas",
    papel: "4",
    sections: [
      {
        title: "Identificação do Locatário",
        fields: [
          {
            name: "nome",
            label: "Nome do Inquilino",
            type: "text",
            fullWidth: true,
          },
          { name: "documento", label: "CPF / RG", type: "text" },
          { name: "email", label: "E-mail de Contato", type: "text" },
        ],
      },
    ],
    aiMetadata:
      "Inquilinos são vinculados a contratos de locação. Verifique se possuem pendências financeiras antes de renovar.",
  },

  // 5. CRM - EQUIPE (O MOTOR INTERNO)
  equipe: {
    title: "Minha Equipe",
    entity: "pessoas",
    papel: "1",
    sections: [
      {
        title: "Dados do Colaborador",
        fields: [
          {
            name: "nome",
            label: "Nome do Funcionário",
            type: "text",
            fullWidth: true,
          },
          {
            name: "cargo",
            label: "Cargo / Função",
            type: "select",
            options: [
              { label: "Corretor", value: "corretor" },
              { label: "Secretária", value: "secretaria" },
              { label: "Financeiro", value: "financeiro" },
            ],
          },
          { name: "email", label: "E-mail Profissional", type: "text" },
        ],
      },
    ],
    aiMetadata:
      "A equipe papel 1 tem acesso restrito por cargo. Corretores só vêem seus próprios imóveis.",
  },

  // 6. FINANCEIRO - GRUPOS DE CAIXA (PLANO DE CONTAS)
  "grupos-caixa": {
    title: "Plano de Contas (Grupos)",
    entity: "configuracoes/grupos-caixa",
    sections: [
      {
        title: "Estrutura Contábil",
        fields: [
          {
            name: "descricao",
            label: "Nome do Grupo (Ex: Aluguéis, Taxas)",
            type: "text",
            fullWidth: true,
          },
          {
            name: "tipo",
            label: "Natureza",
            type: "select",
            options: [
              { label: "Crédito (Entrada)", value: "c" },
              { label: "Débito (Saída)", value: "d" },
            ],
          },
          { name: "codigo", label: "Código Contábil", type: "text" },
        ],
      },
    ],
    aiMetadata:
      "Grupos de caixa organizam o fluxo de faturamento. Essencial para o relatório de DRE.",
  },

  // 7. CONFIGURAÇÕES - UNIDADES
  unidades: {
    title: "Unidades / Filiais",
    entity: "configuracoes/unidades",
    sections: [
      {
        title: "Dados da Unidade",
        fields: [
          {
            name: "nome",
            label: "Nome da Filial",
            type: "text",
            fullWidth: true,
          },
          { name: "cnpj", label: "CNPJ da Unidade", type: "text" },
          { name: "cidade", label: "Cidade de Atuação", type: "text" },
        ],
      },
    ],
  },
  // --- CONTINUAÇÃO DO MAPA_SISMOB ---

  // 8. FINANCEIRO - CONTAS BANCÁRIAS
  "contas-bancarias": {
    title: "Contas Bancárias",
    entity: "configuracoes/contas-bancarias",
    columns: [
      { label: "Apelido", key: "apelido" },
      { label: "Banco", key: "banco_id" },
    ],
    sections: [
      {
        title: "Dados da Conta",
        fields: [
          {
            name: "apelido",
            label: "Apelido da Conta (Ex: Itaú Aluguéis)",
            type: "text",
            fullWidth: true,
          },
          { name: "banco_id", label: "Banco", type: "select" }, // IA buscará na tabela global de bancos
          { name: "agencia", label: "Agência", type: "text" },
          { name: "conta", label: "Número da Conta", type: "text" },
          { name: "digito", label: "Dígito", type: "text" },
        ],
      },
    ],
    aiMetadata:
      "Contas bancárias são vinculadas aos títulos para emissão de boletos e repasse a proprietários.",
  },

  // 9. FINANCEIRO - TÍTULOS (A PAGAR / RECEBER)
  titulos: {
    title: "Gestão de Títulos (Financeiro)",
    entity: "financeiro/titulos",
    columns: [
      { label: "Vencimento", key: "data_vencimento" },
      { label: "Valor", key: "valor_total" },
      { label: "Status", key: "situacao" },
    ],
    sections: [
      {
        title: "Informações do Lançamento",
        fields: [
          {
            name: "pessoa_id",
            label: "Cliente / Fornecedor",
            type: "select",
            fullWidth: true,
          },
          { name: "valor_total", label: "Valor Total (R$)", type: "number" },
          {
            name: "data_vencimento",
            label: "Data de Vencimento",
            type: "date",
          },
          {
            name: "tipo_mov",
            label: "Tipo",
            type: "select",
            options: [
              { label: "Receita (Entrada)", value: "c" },
              { label: "Despesa (Saída)", value: "d" },
            ],
          },
        ],
      },
      {
        title: "Classificação Contábil",
        fields: [
          { name: "grupo_caixa_id", label: "Grupo de Caixa", type: "select" },
          {
            name: "conta_bancaria_id",
            label: "Conta de Destino/Origem",
            type: "select",
          },
        ],
      },
    ],
    aiMetadata:
      "Títulos alimentam o fluxo de caixa. O Agente MCP pode cobrar clientes inadimplentes automaticamente.",
  },

  // 10. AUDITORIA - LOGS DO SISTEMA (VISÃO SUPER-ADMIN)
  logs: {
    title: "Logs de Atividade",
    entity: "ai/logs",
    columns: [
      { label: "Data", key: "created_at" },
      { label: "Usuário", key: "usuario_id" },
      { label: "Ação", key: "operacao" },
    ],
    sections: [
      {
        title: "Rastro Digital",
        fields: [
          {
            name: "descricao",
            label: "Detalhes da Operação",
            type: "text",
            fullWidth: true,
          },
        ],
      },
    ],
  },
  // 11. CONFIGURAÇÕES - ATRIBUTOS (COMODIDADES)
  "atributos-itens": {
    title: "Itens e Comodidades",
    entity: "configuracoes/atributos",
    columns: [{ label: "Nome do Item", key: "nome" }],
    sections: [
      {
        title: "Cadastro de Item",
        fields: [
          {
            name: "nome",
            label: "Ex: Piscina Aquecida, Academia, Laje",
            type: "text",
            fullWidth: true,
          },
          {
            name: "categoria_id",
            label: "Categoria (Lazer, Estrutura...)",
            type: "select",
          },
        ],
      },
    ],
    aiMetadata:
      "Atributos são usados para filtros avançados no portal. Ensine o corretor a marcar todos os itens para melhorar o SEO do imóvel.",
  },

  // 12. OPERACIONAL - VISTORIAS
  vistorias: {
    title: "Vistorias de Imóveis",
    entity: "operacional/vistorias",
    columns: [
      { label: "Imóvel", key: "imovel_id" },
      { label: "Data", key: "data_vistoria" },
      { label: "Status", key: "status" },
    ],
    sections: [
      {
        title: "Dados da Vistoria",
        fields: [
          {
            name: "imovel_id",
            label: "Selecionar Imóvel",
            type: "select",
            fullWidth: true,
          },
          {
            name: "tipo",
            label: "Entrada ou Saída?",
            type: "select",
            options: [
              { label: "Entrada", value: "e" },
              { label: "Saída", value: "s" },
            ],
          },
          {
            name: "observacoes",
            label: "Notas da Vistoria",
            type: "text",
            fullWidth: true,
          },
        ],
      },
    ],
  },
};
