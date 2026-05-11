"use client";
import { use, Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";

function ManutencaoContent({ params }: any) {
  const resolvedParams: any = use(params);
  const papel = resolvedParams.papel;

  const config = (MAPA_SISMOB as any)[papel];

  if (!config)
    return <div className="p-20 text-center">Configuração não localizada.</div>;

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={`/${config.entity}`}
      sections={config.sections}
      aiHelp={config.aiMetadata}
    />
  );
}

export default function Page({ params }: any) {
  return (
    <Suspense
      fallback={
        <div className="p-20 font-black text-indigo-600 animate-pulse">
          Abrindo Manutenção...
        </div>
      }
    >
      <ManutencaoContent params={params} />
    </Suspense>
  );
}
