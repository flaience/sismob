export const PERMISSOES_ROTA: any = {
  "/financeiro/faturamento-flaience": ["0"], // Só o Luis
  "/equipe": ["0", "6"], // Luis e Dono da Imobiliária
  "/financeiro/caixa": ["0", "6", "financeiro"], // Luis, Dono e Cargo Financeiro
  "/imoveis": ["0", "6", "corretor", "secretaria"],
};

export function canAccess(
  userPapel: string,
  userCargo: string,
  route: string,
): boolean {
  if (userPapel === "0") return true; // Super-Admin acessa tudo
  const rolesAllowed = PERMISSOES_ROTA[route];
  if (!rolesAllowed) return true; // Rota pública/comum
  return rolesAllowed.includes(userPapel) || rolesAllowed.includes(userCargo);
}
