//src/app/(admin)/gestao/[papel]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import SismobListMaster from "@/components/SismobListMaster";
import { MAPA_MODULOS } from "../mapa-modulos";

export default function GenericGrid() {
  const { papel } = useParams();
  const config = (MAPA_MODULOS as any)[papel as string];

  if (!config)
    return (
      <div className="p-20 text-center font-black">Módulo em construção...</div>
    );

  return (
    <SismobListMaster
      title={config.title}
      endpoint={`/${config.entity}`}
      filters={{ papel: config.papel }}
      columns={config.columns}
      onAdd={() => (window.location.href = `/gestao/${papel}/manutencao`)}
      onEdit={(item: any) =>
        (window.location.href = `/gestao/${papel}/manutencao?id=${item.id}`)
      }
    />
  );
}
