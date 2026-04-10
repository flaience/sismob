// apps/web/src/lib/utils.ts

export const formatarMoeda = (valor: string | number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
};

export const formatarMetragem = (valor: string | number) => {
  return `${valor} m²`;
};
