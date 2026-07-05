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

  canAccessBrokerHub: boolean;
  canSeeFinancial: boolean;
  canSeeAdministration: boolean;
  canManageUsers: boolean;
  canManageUnits: boolean;
  canManageBankAccounts: boolean;
  canManageAttributes: boolean;
};

export function getSismobPermissions(
  user?: SismobUserLike | null,
): SismobPermissions {
  const papel = user?.papel != null ? String(user.papel) : "";
  const cargo = user?.cargo?.toLowerCase?.() ?? "";

  const isFlaienceAdmin = papel === "0";
  const isOwner = papel === "6";
  const isTeam = papel === "1";

  const isAdministrador = cargo === "administrador";
  const isGerente = cargo === "gerente";
  const isFinanceiro = cargo === "financeiro";
  const isCorretor = cargo === "corretor";
  const isSecretaria = cargo === "secretaria";

  return {
    isFlaienceAdmin,
    isOwner,
    isTeam,

    canAccessBrokerHub:
      isOwner ||
      isTeam ||
      isAdministrador ||
      isGerente ||
      isFinanceiro ||
      isCorretor ||
      isSecretaria,

    canSeeFinancial: isOwner || isAdministrador || isFinanceiro,

    canSeeAdministration: isOwner || isAdministrador || isGerente,

    canManageUsers: isOwner || isAdministrador,

    canManageUnits: isOwner || isAdministrador || isGerente,

    canManageBankAccounts: isOwner || isAdministrador || isFinanceiro,

    canManageAttributes: isOwner || isAdministrador || isGerente,
  };
}

export function canAccessRoute(
  user: SismobUserLike | null | undefined,
  route: string,
): boolean {
  const permissions = getSismobPermissions(user);

  if (route.startsWith("/dashboard")) {
    return permissions.canAccessBrokerHub;
  }

  if (route.startsWith("/gestao/imoveis")) {
    return permissions.canAccessBrokerHub;
  }

  if (route.startsWith("/gestao/negociacoes")) {
    return permissions.canAccessBrokerHub;
  }

  if (route.startsWith("/gestao/proprietarios")) {
    return permissions.canAccessBrokerHub;
  }

  if (route.startsWith("/gestao/leads")) {
    return permissions.canAccessBrokerHub;
  }

  if (route.startsWith("/gestao/compradores")) {
    return permissions.canAccessBrokerHub;
  }

  if (route.startsWith("/gestao/titulos")) {
    return permissions.canSeeFinancial;
  }

  if (route.startsWith("/gestao/livro-caixa")) {
    return permissions.canSeeFinancial;
  }

  if (route.startsWith("/gestao/equipe")) {
    return permissions.canManageUsers;
  }

  if (route.startsWith("/gestao/unidades")) {
    return permissions.canManageUnits;
  }

  if (route.startsWith("/gestao/contas-bancarias")) {
    return permissions.canManageBankAccounts;
  }

  if (route.startsWith("/gestao/atributos-itens")) {
    return permissions.canManageAttributes;
  }

  return true;
}
