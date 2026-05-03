"use client";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";

export const dynamic = "force-dynamic";

function ManutencaoDinamica() {
  const { papel } = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config)
    return <div className="p-20 text-center">Módulo não mapeado.</div>;

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={config.entity}
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
