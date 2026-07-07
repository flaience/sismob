// src/app/[admin]/layout.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import {
  getLicenseMessage,
  getLicenseState,
  shouldShowBillingWarning,
  isTenantSuspended,
} from "@/lib/tenant-state";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoading } = useAuth();
  const { tenant } = useTenant();

  const [safetyRelease, setSafetyRelease] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSafetyRelease(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isStuck = authLoading && !safetyRelease;

  const tenantStatus = tenant?.status;
  const licenseState = getLicenseState(tenantStatus);
  const licenseMessage = getLicenseMessage(tenantStatus);

  const showBillingWarning = shouldShowBillingWarning(tenantStatus);
  const tenantBlocked = isTenantSuspended(tenantStatus);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-[84px] p-4 md:p-10 pb-24 md:pb-10 transition-all">
        {isStuck ? (
          <div className="p-20 text-center animate-pulse font-black text-indigo-600 uppercase tracking-widest">
            Sincronizando Ecossistema...
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            {showBillingWarning && licenseMessage && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest">
                  Atenção Financeira
                </p>
                <p className="mt-1 text-sm font-bold">{licenseMessage}</p>
              </div>
            )}

            {tenantBlocked && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest">
                  Operação Bloqueada
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight">
                  Tenant em modo consulta
                </h2>
                <p className="mt-2 text-sm font-bold">
                  {licenseMessage ||
                    "Este tenant não está autorizado a executar novas operações."}
                </p>
                <p className="mt-3 text-xs font-semibold text-red-600">
                  Estado atual: {licenseState}
                </p>
              </div>
            )}

            {children}
          </div>
        )}
      </main>
    </div>
  );
}
