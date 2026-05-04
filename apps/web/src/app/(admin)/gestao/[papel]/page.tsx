"use client";
import { use } from "react"; // Para Next.js 15
import SismobListMaster from "@/components/SismobListMaster";
import { MAPA_SISMOB } from "../mapa-modulos";

export const dynamic = "force-dynamic";

export default function GenericGridPage({ params }: any) {
  // 1. Resolvemos os parâmetros da URL
  const resolvedParams: any = use(params);
  const papel = resolvedParams.papel;

  // 2. Buscamos a configuração no Mapa
  const config = (MAPA_SISMOB as any)[papel as string];

  // 3. Se não houver config, mostramos um erro amigável em vez de crashar
  if (!config) {
    return (
      <div className="p-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
        <h1 className="text-3xl font-black text-slate-300 uppercase">
          Módulo em Construção
        </h1>
        <p className="text-slate-400 mt-2">
          O slug <strong>{papel}</strong> não foi mapeado.
        </p>
      </div>
    );
  }

  return <SismobListMaster config={config} papelUrl={papel} />;
}
