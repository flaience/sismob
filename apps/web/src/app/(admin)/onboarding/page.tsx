"use client";
import { Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../gestao/mapa-modulos"; // Beba da fonte do DNA

function OnboardingContent() {
  // 1. O SEGREDO DA AGILIDADE:
  // Puxamos a configuração completa (com Logo, Nome Fantasia, Endereço, etc) do Mapa
  const config = MAPA_SISMOB.imobiliarias;

  if (!config)
    return (
      <div className="p-20 text-center font-black">
        Módulo 'imobiliarias' não mapeado no sistema.
      </div>
    );

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={config.entity} // saas/onboarding
      sections={config.sections} // Aqui vêm as 3 seções: Marca, Contato e Endereço
      aiHelp={config.aiMetadata}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <div className="animate-pulse font-black text-indigo-600 uppercase tracking-widest">
            Iniciando Esteira Industrial...
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
