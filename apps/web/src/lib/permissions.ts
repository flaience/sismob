// src/lib/permissions.ts

export type SismobUserLike = {
  email?: string | null;
  papel?: string | number | null;
  cargo?: string | null;
};

export type SismobPermissions = {
  isFlaienceAdmin: boolean;
  isOwner: boolean;
  isTeam: boolean;
  isTenantAdmin: boolean;

  canAccessBrokerHub: boolean;
  canSeeFinancial: boolean;
  canSeeAdministration: boolean;
  canManageUsers: boolean;
  canManageUnits: boolean;
  canManageBankAccounts: boolean;
  canManageAttributes: boolean;
};

function normalize(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function getSismobPermissions(
  user?: SismobUserLike | null,
): SismobPermissions {
  const papel = normalize(user?.papel);
  const cargo = normalize(user?.cargo);

  const isFlaienceAdmin = papel === "0";
  const isOwner = papel === "6";
  const isTeam = papel === "1";

  const isAdministrador = cargo === "administrador" || cargo === "admin";
  const isGerente = cargo === "gerente";
  const isFinanceiro = cargo === "financeiro";
  const isCorretor = cargo === "corretor";
  const isSecretaria = cargo === "secretaria";

  // Usuários com poder total dentro do SISMOB
  const isTenantAdmin =
    isFlaienceAdmin || isOwner || isAdministrador || isGerente;

  return {
    isFlaienceAdmin,
    isOwner,
    isTeam,
    isTenantAdmin,

    // Todos autenticados no SISMOB veem o hub operacional
    canAccessBrokerHub:
      isTenantAdmin || isTeam || isFinanceiro || isCorretor || isSecretaria,

    // Owner, Luis, administrador e financeiro veem tesouraria
    canSeeFinancial: isTenantAdmin || isFinanceiro,

    // Owner, Luis, administrador e gerente veem administração
    canSeeAdministration: isTenantAdmin,

    // Quem pode criar usuários
    canManageUsers: isFlaienceAdmin || isOwner || isAdministrador,

    canManageUnits: isTenantAdmin,

    canManageBankAccounts: isTenantAdmin || isFinanceiro,

    canManageAttributes: isTenantAdmin,
  };
}

export function canAccessRoute(
  user: SismobUserLike | null | undefined,
  route: string,
): boolean {
  const permissions = getSismobPermissions(user);

  if (route.startsWith("/dashboard")) return permissions.canAccessBrokerHub;

  if (route.startsWith("/gestao/imoveis"))
    return permissions.canAccessBrokerHub;
  if (route.startsWith("/gestao/negociacoes"))
    return permissions.canAccessBrokerHub;
  if (route.startsWith("/gestao/proprietarios"))
    return permissions.canAccessBrokerHub;
  if (route.startsWith("/gestao/leads")) return permissions.canAccessBrokerHub;
  if (route.startsWith("/gestao/compradores"))
    return permissions.canAccessBrokerHub;

  if (route.startsWith("/gestao/titulos")) return permissions.canSeeFinancial;
  if (route.startsWith("/gestao/livro-caixa"))
    return permissions.canSeeFinancial;

  if (route.startsWith("/gestao/equipe")) return permissions.canManageUsers;
  if (route.startsWith("/gestao/unidades")) return permissions.canManageUnits;
  if (route.startsWith("/gestao/contas-bancarias"))
    return permissions.canManageBankAccounts;
  if (route.startsWith("/gestao/atributos-itens"))
    return permissions.canManageAttributes;

  return true;
}
