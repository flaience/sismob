"use client";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../mapa-modulos";

export const dynamic = "force-dynamic";

function ManutencaoDinamica() {
  const { papel } = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Puxa a configuração do seu mapa mestre
  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config) {
    return (
      <div className="p-20 text-center font-black">Módulo não mapeado.</div>
    );
  }

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={config.entity} // ex: pessoas ou imoveis
      sections={config.sections}
      aiHelp={config.aiMetadata}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-20 animate-pulse font-black text-indigo-600 uppercase">
          Iniciando Motor Industrial...
        </div>
      }
    >
      <ManutencaoDinamica />
    </Suspense>
  );
}
