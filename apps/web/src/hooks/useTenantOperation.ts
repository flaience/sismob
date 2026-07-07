"use client";

import { useTenant } from "@/context/TenantContext";
import {
  canOperateTenant,
  getLicenseMessage,
  getLicenseState,
  isTenantSuspended,
  shouldShowBillingWarning,
} from "@/lib/tenant-state";

export function useTenantOperation() {
  const { tenant } = useTenant();

  const status = tenant?.status;

  const state = getLicenseState(status);
  const canOperate = canOperateTenant(status);
  const isBlocked = isTenantSuspended(status);
  const showBillingWarning = shouldShowBillingWarning(status);
  const message = getLicenseMessage(status);

  return {
    tenant,
    status,
    state,
    canOperate,
    isBlocked,
    showBillingWarning,
    message,
  };
}
