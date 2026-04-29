export const MAPA_SISMOB = {
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
};
