"use client";
import { Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";

// 1. Criamos um componente interno com o conteúdo
function OnboardingContent() {
  return (
    <SismobFormMaster
      title="Nova Imobiliária"
      endpoint="/saas/onboarding"
      sections={[
        {
          title: "Dados da Empresa",
          fields: [
            {
              name: "nomeEmpresa",
              label: "Nome da Imobiliária",
              type: "text",
              fullWidth: true,
            },
            { name: "slug", label: "Slug / Link", type: "text" },
          ],
        },
      ]}
    />
  );
}

// 2. Exportamos a página envolvida em Suspense (Obrigatório para Vercel)
export default function OnboardingPage() {
  return (
    <Suspense
      fallback={<div className="p-10 font-black">Carregando formulário...</div>}
    >
      <OnboardingContent />
    </Suspense>
  );
}
