"use client";
import { useParams, useRouter } from "next/navigation";
import SismobListMaster from "@/components/SismobListMaster";
import { MAPA_SISMOB } from "../mapa-modulos";

export const dynamic = "force-dynamic";

export default function GenericGridPage() {
  const { papel } = useParams();
  const router = useRouter();
  const config = (MAPA_SISMOB as any)[papel as string];

  if (!config)
    return (
      <div className="p-20 text-center font-black">Módulo não mapeado.</div>
    );

  return (
    <SismobListMaster
      title={config.title}
      endpoint={`/${config.entity}`}
      filters={config.papel ? { papel: config.papel } : {}}
      columns={config.columns}
      aiHelp={config.aiMetadata}
      // O SEGREDO: O botão "Novo" leva para a subpasta /manutencao
      onAdd={() => router.push(`/gestao/${papel}/manutencao`)}
      onEdit={(item: any) =>
        router.push(`/gestao/${papel}/manutencao?id=${item.id}`)
      }
    />
  );
}
