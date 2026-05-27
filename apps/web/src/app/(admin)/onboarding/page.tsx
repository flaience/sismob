"use client";
import { Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../gestao/mapa-modulos"; // <--- BEBE DA FONTE DO MAPA

function OnboardingContent() {
  // PUXA A INTELIGÊNCIA DO MAPA (Aqui estão as 3 seções e os 10+ campos)
  const config = MAPA_SISMOB.imobiliarias;

  if (!config)
    return (
      <div className="p-20 text-center font-black">
        Módulo 'imobiliarias' não mapeado.
      </div>
    );

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={config.entity} // saas/onboarding
      sections={config.sections}
      aiHelp={config.aiMetadata}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white font-black text-indigo-600 animate-pulse uppercase">
          Iniciando Esteira Industrial...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
