"use client";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";

export const dynamic = "force-dynamic";

function ManutencaoContent() {
  // 1. O Next.js 15 prefere useParams() em Client Components para evitar o erro de hidratação
  const { papel } = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config) {
    return (
      <div className="p-20 text-center font-black">
        Módulo "{papel}" não encontrado.
      </div>
    );
  }

  // 2. Mapeamento Industrial (Garante que o registro nasça na gaveta certa do banco)
  const tradutorPapel: any = {
    leads: "2",
    proprietarios: "3",
    inquilinos: "4",
    equipe: "1",
    compradores: "7",
  };

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={`/${config.entity}`} // Garante a barra inicial para a rota
      // Injeta o papel automático se for uma entidade de 'pessoas'
      initialData={{ papel: tradutorPapel[papel as string] }}
      sections={config.sections}
      aiHelp={config.aiMetadata}
    />
  );
}

export default function ManutencaoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 font-black text-indigo-600 animate-pulse uppercase">
          Sincronizando com a Fábrica...
        </div>
      }
    >
      <ManutencaoContent />
    </Suspense>
  );
}
