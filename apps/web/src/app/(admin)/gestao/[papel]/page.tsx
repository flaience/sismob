"use client";
import { use, Suspense } from "react"; // 1. IMPORTANTE: Usar o 'use' do React
import SismobListMaster from "@/components/SismobListMaster";
import { MAPA_SISMOB } from "../mapa-modulos";

export const dynamic = "force-dynamic";

export default function GenericGridPage({ params }: any) {
  // 2. O SEGREDO DO NEXT.JS 15: Precisamos dar 'use' na promessa do params
  const resolvedParams: any = use(params);
  const papel = resolvedParams.papel;

  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-black text-slate-300">
          MÓDULO "{papel}" NÃO ENCONTRADO
        </h1>
        <p className="text-slate-400">
          Verifique a escrita no arquivo mapa-modulos.ts
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="p-20 font-black animate-pulse">
          CARREGANDO FÁBRICA...
        </div>
      }
    >
      <SismobListMaster config={config} papelUrl={papel} />
    </Suspense>
  );
}
