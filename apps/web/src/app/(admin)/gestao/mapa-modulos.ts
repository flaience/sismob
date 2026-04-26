export const MAPA_SISMOB = {
  bancos: {
    title: "Bancos",
    entity: "bancos",
    fields: [
      { name: "nome", label: "Nome", type: "text" },
      { name: "codigo_compe", label: "Código", type: "text" },
    ],
  },
  imoveis: {
    title: "Estoque de Imóveis",
    entity: "imoveis",
    masterDetail: true,
    sections: [
      {
        title: "Dados Gerais",
        fields: [
          { name: "titulo", type: "text" },
          { name: "preco", type: "number" },
        ],
      },
      {
        title: "Mídia 360",
        fields: [{ name: "fotos", type: "detail", entity: "midias" }],
      },
    ],
  },
};
