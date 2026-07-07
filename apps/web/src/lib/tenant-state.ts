// src/lib/license-gate.ts

export type TenantStatus =
  | "trial"
  | "ativo"
  | "inadimplente"
  | "suspenso"
  | "cancelado"
  | string
  | null
  | undefined;

export type LicenseState =
  | "trial"
  | "active"
  | "overdue"
  | "suspended"
  | "cancelled";

export function getLicenseState(status: TenantStatus): LicenseState {
  const normalized = String(status ?? "trial")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "ativo":
    case "active":
      return "active";

    case "inadimplente":
    case "overdue":
      return "overdue";

    case "suspenso":
    case "suspended":
      return "suspended";

    case "cancelado":
    case "cancelled":
      return "cancelled";

    case "trial":
    default:
      return "trial";
  }
}

export function canOperateTenant(status: TenantStatus): boolean {
  const state = getLicenseState(status);

  return state === "trial" || state === "active" || state === "overdue";
}

export function isTenantSuspended(status: TenantStatus): boolean {
  const state = getLicenseState(status);

  return state === "suspended" || state === "cancelled";
}

export function shouldShowBillingWarning(status: TenantStatus): boolean {
  return getLicenseState(status) === "overdue";
}

export function getLicenseMessage(status: TenantStatus): string | null {
  const state = getLicenseState(status);

  if (state === "overdue") {
    return "Existem pendências financeiras neste tenant. Regularize para evitar suspensão.";
  }

  if (state === "suspended") {
    return "Este tenant está suspenso. O acesso aos dados permanece disponível, mas novas operações estão bloqueadas.";
  }

  if (state === "cancelled") {
    return "Este tenant foi cancelado. Os dados permanecem preservados, mas a operação está bloqueada.";
  }

  return null;
}
