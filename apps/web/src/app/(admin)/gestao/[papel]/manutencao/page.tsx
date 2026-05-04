"use client";
import { use, Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";
import { MAPA_SISMOB } from "../../mapa-modulos";
import { useParams } from "next/navigation";

export const dynamic = "force-dynamic";

function ManutencaoContent({ params }: any) {
  const resolvedParams: any = use(params);
  const { papel } = useParams(); // ex: leads, proprietarios

  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config)
    return (
      <div className="p-20 text-center font-black">
        CONFIGURAÇÃO NÃO LOCALIZADA.
      </div>
    );

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
      endpoint={config.entity}
      // PASSAMOS O PAPEL DENTRO DO FORMDATA INICIAL
      initialData={{ papel: tradutorPapel[papel as string] }}
      sections={config.sections}
    />
  );
}

export default function ManutencaoPage({ params }: any) {
  return (
    <Suspense
      fallback={
        <div className="p-20 font-black text-indigo-600 animate-pulse uppercase">
          Preparando Formulário...
        </div>
      }
    >
      <ManutencaoContent params={params} />
    </Suspense>
  );
}
