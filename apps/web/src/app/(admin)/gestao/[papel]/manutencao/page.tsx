"use client";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";

export const dynamic = "force-dynamic";

function ManutencaoContent() {
  const { papel } = useParams(); // Pega da URL (ex: leads, proprietarios)
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // 1. O DICIONÁRIO (Se você não definir isso, o erro de 'não reconhece' continua)
  const tradutorPapel: Record<string, string> = {
    leads: "2",
    proprietarios: "3",
    inquilinos: "4",
    equipe: "1",
    compradores: "7",
  };

  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config) {
    return (
      <div className="p-20 text-center font-black">Módulo não mapeado.</div>
    );
  }

  return (
    <SismobFormMaster
      title={config.title}
      endpoint={`/${config.entity}`}
      sections={config.sections}
      // 2. PASSANDO A AJUDA DA IA (MCP)
      aiHelp={config.aiMetadata}
      // 3. INJETANDO O PAPEL AUTOMÁTICO (Agora reconhece o tradutorPapel)
      initialData={{ papel: tradutorPapel[papel as string] }}
    />
  );
}

export default function ManutencaoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 animate-pulse font-black text-indigo-600 uppercase">
          Acessando Fábrica...
        </div>
      }
    >
      <ManutencaoContent />
    </Suspense>
  );
}
