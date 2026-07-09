//src/app/[admin]/gestao/[papel]/manutencao/page.tsx
"use client";
import { use, Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";

export const dynamic = "force-dynamic";

function ManutencaoContent({ params }: any) {
  const resolvedParams: any = use(params);
  const papel = resolvedParams.papel;

  const config = (MAPA_SISMOB as any)[papel];

  if (!config)
    return (
      <div className="p-20 text-center font-black">
        CONFIGURAÇÃO NÃO LOCALIZADA.
      </div>
    );

  // 1. TRADUTOR INDUSTRIAL: Converte a URL no ID que o banco exige
  const tradutorPapel: Record<string, string> = {
    leads: "2",
    proprietarios: "3",
    inquilinos: "4",
    equipe: "1",
    compradores: "7",
  };

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={`/${config.entity}`}
      sections={config.sections}
      aiHelp={config.aiMetadata}
      // 2. O SEGREDO: Injeta o papel automático para o banco não dar erro 500
      initialData={{ papel: tradutorPapel[papel as string] }}
    />
  );
}

export default function Page({ params }: any) {
  return (
    <Suspense
      fallback={
        <div className="p-20 font-black text-indigo-600 animate-pulse">
          ABRINDO ESTEIRA DE PRODUÇÃO...
        </div>
      }
    >
      <ManutencaoContent params={params} />
    </Suspense>
  );
}
