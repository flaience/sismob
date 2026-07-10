//src/app/[admin]/gestao/[papel]/page.tsx
"use client";
import { use, Suspense } from "react";
import SismobListMaster from "@/components/SismobListMaster";
import { MAPA_SISMOB } from "../mapa-modulos";

export default function GenericGridPage({ params }: any) {
  // 1. DESEMPACOTA A URL (Obrigatório no Next 15)
  const resolvedParams: any = use(params);
  const papel = resolvedParams.papel;

  const config = (MAPA_SISMOB as any)[papel];

  if (!config)
    return (
      <div className="p-20 text-center font-black">
        MÓDULO "{papel}" NÃO ENCONTRADO NO MAPA.
      </div>
    );

  return (
    <Suspense
      fallback={
        <div className="p-20 font-black animate-pulse uppercase">
          Sincronizando...
        </div>
      }
    >
      <SismobListMaster config={config} papelUrl={papel} />
    </Suspense>
  );
}
