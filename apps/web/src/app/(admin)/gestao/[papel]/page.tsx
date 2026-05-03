//src/app/(admin)/gestao/[papel]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import SismobListMaster from "@/components/SismobListMaster";
import { MAPA_SISMOB } from "../mapa-modulos";

export default function GenericGrid() {
  const { papel } = useParams();
  const router = useRouter();

  // 1. O SEGREDO: Forçamos o casting para 'any' para o TS não reclamar da chave string
  const config = (MAPA_SISMOB as any)[papel as string];

  // 2. PROTEÇÃO: Se o módulo não existir no mapa, avisa o gestor
  if (!config) {
    return (
      <div className="p-20 text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-300 uppercase italic">
          Módulo em Construção
        </h2>
        <p className="text-slate-400">
          O slug <code className="bg-slate-100 p-1 rounded">{papel}</code> não
          foi encontrado no MAPA_SISMOB.
        </p>
      </div>
    );
  }

  return (
    <SismobListMaster
      title={config.title}
      endpoint={`/${config.entity}`}
      // 3. FILTRO INTELIGENTE: Só aplica o papel se o módulo exigir (Pessoas)
      filters={config.papel ? { papel: config.papel } : {}}
      columns={config.columns}
      // 4. AJUDA IA: Passamos o texto que você escreveu no mapa para o botão do microfone
      aiHelp={config.aiMetadata}
      // 5. NAVEGAÇÃO NEXT.JS (Sem recarregar a página)
      onAdd={() => router.push(`/gestao/${papel}/manutencao`)}
      onEdit={(item: any) =>
        router.push(`/gestao/${papel}/manutencao?id=${item.id}`)
      }
    />
  );
}
