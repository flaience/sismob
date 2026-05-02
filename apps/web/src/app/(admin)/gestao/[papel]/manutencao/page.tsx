"use client";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";

function ManutencaoDinamica() {
  const { papel } = useParams(); // ex: leads, proprietarios, imobiliarias
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Busca a configuração no seu MAPA_SISMOB
  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config) {
    return (
      <div className="p-20 text-center font-black">
        Módulo "{papel}" não configurado no Mapa.
      </div>
    );
  }

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
        <div className="p-20 animate-pulse font-black text-indigo-600">
          INICIANDO MOTOR DE GESTÃO...
        </div>
      }
    >
      <ManutencaoDinamica />
    </Suspense>
  );
}
