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
  // 1. EQUIPE (Corrigindo o 404)
  equipe: {
    title: "Minha Equipe",
    entity: "pessoas",
    papel: "1",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "Cargo", key: "cargo" },
      { label: "WhatsApp", key: "telefone" },
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
            label: "E-mail de Login",
            type: "text",
            required: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
          { name: "telefone", label: "WhatsApp Corporativo", type: "text" },
          {
            name: "cargo",
            label: "Cargo / Função",
            type: "select",
            required: true,
            options: [
              { label: "Corretor", value: "corretor" },
              { label: "Secretária", value: "secretaria" },
              { label: "Gerente Financeiro", value: "financeiro" },
              { label: "Gestor de Vendas", value: "gerente" },
            ],
          },
          {
            name: "unidade_id",
            label: "Filial de Trabalho",
            type: "select",
            required: true,
          },
        ],
      },
      // Injetamos a Seção de Endereço que já criamos para agilizar
      SECAO_ENDERECO,
    ],
  },
  // apps/web/src/app/(admin)/gestao/mapa-modulos.ts

  "gestao-flaience": {
    title: "Controle de Fábrica (SaaS)",
    entity: "saas/tenants",
    columns: [
      { label: "Imobiliária", key: "nome_fantasia" },
      { label: "Status", key: "status" },
      { label: "Versão", key: "version_schema" },
    ],
    sections: [
      {
        title: "Status da Licença",
        fields: [
          {
            name: "nome_conta",
            label: "Razão Social",
            type: "text",
            required: true,
          },
          {
            name: "status",
            label: "Situação do Acesso",
            type: "select",
            options: [
              { label: "✅ Ativo", value: "ativo" },
              { label: "⏳ Trial", value: "trial" },
              { label: "🚫 Suspenso", value: "suspenso" },
            ],
          },
          { name: "data_vencimento", label: "Próxima Renovação", type: "date" },
        ],
      },
    ],
    aiMetadata:
      "Luis, este é o controle mestre. Se você suspender uma imobiliária aqui, o Agente MCP bloqueará o acesso de todos os corretores dela instantaneamente.",
  },
  // --- CRM COMERCIAL ---
  leads: {
    title: "Interessados (Leads)",
    entity: "pessoas",
    papel: "2",
    columns: [
      { label: "Nome", key: "nome" },
      { label: "WhatsApp", key: "telefone" }, // <--- RESTAURADO NO GRID
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
          {
            name: "email",
            label: "E-mail Corporativo",
            type: "text",
            required: true,
          },
          { name: "telefone", label: "WhatsApp", type: "text", required: true }, // <--- OBRIGATÓRIO NO FORM
          { name: "unidade_id", label: "Unidade Responsável", type: "select" },
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
      { label: "WhatsApp", key: "telefone" }, // <--- RESTAURADO NO GRID
    ],
    sections: [
      {
        title: "Dados do Comprador",
        fields: [
          {
            name: "nome",
            label: "Nome Completo",
            type: "text",
            required: true,
            fullWidth: true,
          },
          { name: "documento", label: "CPF", type: "text", required: true },
          {
            name: "email",
            label: "E-mail de Contato",
            type: "text",
            required: true,
          },
          { name: "telefone", label: "WhatsApp", type: "text", required: true },
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
      { label: "WhatsApp", key: "telefone" }, // <--- RESTAURADO NO GRID
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
          {
            name: "telefone",
            label: "WhatsApp / Celular",
            type: "text",
            required: true,
          }, // <--- OBRIGATÓRIO NO FORM
          {
            name: "tipo",
            label: "Tipo",
            type: "select",
            options: [
              { label: "Física", value: "f" },
              { label: "Jurídica", value: "j" },
            ],
          },
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
    title: "Estoque de Imóveis",
    entity: "imoveis",
    columns: [
      { label: "Título", key: "titulo" },
      { label: "Bairro", key: "bairro" },
      { label: "Cidade", key: "cidade" },
      { label: "Valor Venda", key: "preco_venda" },
      { label: "Status", key: "status" },
    ],
    sections: [
      {
        title: "Apresentação e Anúncio",
        fields: [
          {
            name: "titulo",
            label: "Título do Anúncio",
            type: "text",
            required: true,
            fullWidth: true,
          },
          {
            name: "descricao",
            label: "Descrição Detalhada para IA",
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
              { label: "Cobertura", value: "cobertura" },
            ],
          },
          {
            name: "status",
            label: "Situação Atual",
            type: "select",
            options: [
              { label: "Disponível", value: "disponivel" },
              { label: "Vendido", value: "vendido" },
              { label: "Locado", value: "locado" },
            ],
          },
          {
            name: "proprietario_id",
            label: "Proprietário (Dono)",
            type: "select",
            required: true,
          },
          {
            name: "unidade_id",
            label: "Unidade Responsável",
            type: "select",
            required: true,
          },
        ],
      },
      {
        title: "Localização Estruturada",
        fields: [
          { name: "cep", label: "CEP", type: "text" },
          {
            name: "logradouro",
            label: "Rua/Avenida",
            type: "text",
            fullWidth: true,
          },
          { name: "numero", label: "Nº", type: "text" },
          { name: "bairro", label: "Bairro", type: "text" },
          { name: "cidade", label: "Cidade", type: "text" },
          { name: "estado", label: "UF", type: "text" },
        ],
      },
      {
        title: "Valores e Dimensões",
        fields: [
          { name: "preco_venda", label: "Valor de Venda (R$)", type: "number" },
          {
            name: "preco_aluguel",
            label: "Valor Locação (R$)",
            type: "number",
          },
          { name: "area_privativa", label: "M² Privativos", type: "number" },
        ],
      },
      {
        title: "Acessórios e Comodidades (Cardápio)",
        fields: [
          {
            name: "atributos",
            label: "Selecione o que o imóvel possui",
            type: "checklist",
            entity: "atributos",
          },
        ],
      },
      {
        title: "Galeria de Mídias Profissional",
        fields: [
          {
            name: "midias",
            label: "Fotos (Capa e 360° são marcadas no atalho)",
            type: "gallery",
          },
          {
            name: "video_url",
            label: "Link do Vídeo Externo (YouTube/Drone)",
            type: "text",
            fullWidth: true,
          },
        ],
      },
    ],
    aiMetadata:
      "Imóveis com endereço estruturado e acessórios marcados permitem que a IA faça filtros cirúrgicos e vistorias automáticas.",
  },
  // 1. O PAI: Categorias (Ex: Lazer, Estrutura)
  "categorias-atributos": {
    title: "Categorias de Itens",
    entity: "configuracoes/categorias-atributos", // URL da rota
    columns: [{ label: "Nome da Categoria", key: "nome" }],
    sections: [
      {
        title: "Geral",
        fields: [
          {
            name: "nome",
            label: "Ex: Lazer, Estrutura, Segurança, Infraestrutura ",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
    ],
  },

  // 2. O FILHO: Itens/Comodidades (Ex: Piscina, Suíte)
  // Mantenha esta chave pois é a que sua Sidebar chama
  "atributos-itens": {
    title: "Itens e Comodidades",
    entity: "configuracoes/atributos", // URL da rota
    columns: [
      { label: "Item", key: "nome" },
      { label: "Qtd Padrão", key: "quantidade" },
    ],
    sections: [
      {
        title: "Configuração do Item",
        fields: [
          {
            name: "nome",
            label: "Descrição (Ex: Quarto, Suíte)",
            type: "text",
            required: true,
          },
          {
            name: "quantidade",
            label: "Quantidade Padrão",
            type: "number",
            required: true,
          },
          // VINCULA AO PAI:
          {
            name: "categoria_id",
            label: "Categoria do Item",
            type: "select",
            required: true,
          },
        ],
      },
    ],
  },

  // apps/web/src/app/(admin)/gestao/mapa-modulos.ts

  negociacoes: {
    title: "Vendas e Negociações",
    entity: "negociacoes",
    columns: [
      { label: "Cliente", key: "cliente_nome" },
      { label: "Imóvel", key: "imovel_titulo" },
      { label: "Estágio", key: "status" },
      { label: "Intensidade", key: "intensidade" },
    ],
    sections: [
      {
        title: "1. Vínculo Rápido (O que o corretor faz em 10s)",
        fields: [
          {
            name: "imovel_id",
            label: "Imóvel",
            type: "select",
            required: true,
          },
          {
            name: "cliente_id",
            label: "Interessado / Comprador",
            type: "select",
            required: true,
          },
          {
            name: "intensidade",
            label: "Qual a temperatura?",
            type: "select",
            required: true,
            options: [
              { label: "❄️ Frio (Só olhando)", value: "baixa" },
              { label: "⏳ Morno (Interesse real)", value: "media" },
              { label: "☀️ Quente (Proposta vindo)", value: "alta" },
              { label: "🔥 Urgente (Fechamento)", value: "urgente" },
            ],
          },
        ],
      },
      {
        title: "2. Proposta e Evolução",
        fields: [
          {
            name: "valor_proposta",
            label: "Valor Oferecido (R$)",
            type: "number",
          },
          {
            name: "corretor_id",
            label: "Corretor Responsável",
            type: "select",
            required: true,
          },
        ],
      },
      {
        title: "3. Engenharia de Fechamento (Para o Contrato)",
        fields: [
          // Aqui entra o Honda Civic, a entrada e as parcelas
          {
            name: "estrutura_pagamento",
            label: "Composição da Verba",
            type: "payment-builder",
          },
          {
            name: "comissao_total",
            label: "Comissão Final (R$)",
            type: "number",
          },
        ],
      },
    ],
    aiMetadata:
      "Negociações começam como vínculos. Se o status for 'proposta', o Agente MCP deve sugerir o preenchimento da seção 3 para gerar a minuta automática.",
  },

  // --- FINANCEIRO --
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

  // apps/web/src/app/(admin)/gestao/mapa-modulos.ts

  imobiliarias: {
    title: "Gestão de Imobiliárias",
    entity: "saas/tenants",
    columns: [
      { label: "Fantasia", key: "nome_fantasia" }, // <--- IDÊNTICO AO BANCO
      { label: "WhatsApp", key: "telefone" }, // <--- IDÊNTICO AO BANCO
      { label: "E-mail", key: "email_financeiro" },
      { label: "Razão Social", key: "nome_conta" },
    ],
    sections: [
      {
        title: "Identidade Visual",
        fields: [
          {
            name: "nome_fantasia",
            label: "Nome Fantasia",
            type: "text",
            required: true,
          },
          { name: "url_logo", label: "Logo URL", type: "image" },
          {
            name: "nome_conta",
            label: "Razão Social / CNPJ",
            type: "text",
            required: true,
            fullWidth: true,
          },
        ],
      },
      {
        title: "Acesso e Contato",
        fields: [
          {
            name: "nomeDono",
            label: "Nome do Proprietário",
            type: "text",
            required: true,
          }, // <--- ADICIONADO
          { name: "slug", label: "Slug/Link", type: "text", required: true },
          {
            name: "email_financeiro",
            label: "E-mail de Acesso e Cobrança",
            type: "text",
            required: true,
          },
          {
            name: "telefone",
            label: "WhatsApp de Suporte",
            type: "text",
            required: true,
          },
        ],
      },
      SECAO_ENDERECO,
    ],
  },
};
