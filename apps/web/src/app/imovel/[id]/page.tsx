"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { useTenant } from "@/context/TenantContext";
import {
  MapPin,
  Info,
  ArrowLeft,
  Navigation,
  Phone,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";

// Visualizador 360 carregado apenas no cliente
const Visualizador360: any = dynamic(
  () => import("pannellum-react").then((mod) => mod.Pannellum),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-900 animate-pulse flex items-center justify-center text-white">
        Iniciando motor 360...
      </div>
    ),
  },
);

export default function ImovelDetalhes() {
  const { id } = useParams();
  const router = useRouter();
  const { tenant } = useTenant();
  const [imovel, setImovel] = useState<any>(null);

  useEffect(() => {
    if (tenant?.id) {
      api.get(`/imoveis`).then((res) => {
        // Busca o imóvel e valida se pertence a esta imobiliária
        const encontrou = res.data.find(
          (i: any) => i.id === Number(id) && i.imobiliariaId === tenant.id,
        );
        if (!encontrou) {
          alert("Imóvel não encontrado nesta imobiliária.");
          router.push("/");
        }
        setImovel(encontrou);
      });
    }
  }, [id, tenant]);

  if (!imovel)
    return (
      <div className="p-20 text-center text-gray-400">
        Carregando experiência...
      </div>
    );

  const foto360 = imovel.midias?.find((m: any) => m.tipo === "foto_360")?.url;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* 1. VOLTAR E STATUS */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-all"
        >
          <ArrowLeft size={20} /> Listagem de Imóveis
        </Link>
        <span className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
          {imovel.status}
        </span>
      </div>

      {/* 2. TÍTULO E TOUR 360 */}
      <section className="space-y-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
            {imovel.titulo}
          </h1>
          <p className="flex items-center text-gray-400 mt-2 font-medium">
            <MapPin size={18} className="mr-1 text-indigo-500" />{" "}
            {imovel.enderecoOriginal}
          </p>
        </div>

        {/* ÁREA DO TOUR VIRTUAL */}
        <div className="relative h-[650px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white bg-gray-950">
          {foto360 ? (
            /* @ts-ignore */
            <Visualizador360
              width="100%"
              height="100%"
              image={foto360}
              pitch={10}
              yaw={180}
              hfov={110}
              autoLoad
              showFullscreenCtrl={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 flex-col gap-4">
              <Info size={64} className="opacity-20" />
              <p className="font-bold">
                Tour Virtual em processamento ou não disponível.
              </p>
            </div>
          )}
          <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            VIRTUAL TOUR ATIVO
          </div>
        </div>
      </section>

      {/* 3. DESCRIÇÃO E AUXÍLIO DE CHEGADA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-900">
              Sobre o Imóvel
            </h3>
            <p className="text-gray-500 leading-relaxed text-lg">
              {imovel.descricao}
            </p>

            {/* Infraestrutura rápida */}
            <div className="flex gap-4 mt-10">
              {imovel.infraestrutura?.temEsperaSplit && (
                <span className="bg-gray-50 p-4 rounded-2xl text-xs font-bold text-gray-600">
                  ❄️ Espera para Split
                </span>
              )}
              {imovel.infraestrutura?.temAguaQuente && (
                <span className="bg-gray-50 p-4 rounded-2xl text-xs font-bold text-gray-600">
                  🔥 Água Quente
                </span>
              )}
              {imovel.infraestrutura?.mobiliado && (
                <span className="bg-gray-50 p-4 rounded-2xl text-xs font-bold text-gray-600">
                  🛋️ Mobiliado
                </span>
              )}
            </div>
          </div>

          {/* Call to Action WhatsApp */}
          <button className="w-full bg-green-500 hover:bg-green-600 text-white p-8 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all shadow-xl shadow-green-100 group">
            <MessageCircle
              size={32}
              className="group-hover:scale-110 transition-transform"
            />
            <div className="text-left">
              <p className="text-xs font-black uppercase opacity-80">
                Gostou deste imóvel?
              </p>
              <p className="text-2xl font-black">
                Falar com um Consultor agora
              </p>
            </div>
          </button>
        </div>

        {/* AUXÍLIO DE CHEGADA (SEU TRUNFO) */}
        <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 blur-[80px] opacity-20" />
          <div className="flex items-center gap-3 mb-10">
            <Navigation className="text-indigo-400" />
            <h3 className="text-2xl font-black tracking-tight">Como chegar</h3>
          </div>

          <div className="space-y-10 relative">
            {imovel.instrucoes?.length > 0 ? (
              imovel.instrucoes.map((ins: any, index: number) => (
                <div key={ins.id} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    {index !== imovel.instrucoes.length - 1 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-indigo-600 to-transparent my-2" />
                    )}
                  </div>
                  <div className="pb-4">
                    <h4 className="font-black text-indigo-400 uppercase text-xs tracking-widest">
                      {ins.titulo}
                    </h4>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                      {ins.descricao}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <p>Nenhum percurso guiado disponível para este imóvel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
