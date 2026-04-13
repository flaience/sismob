"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { useTenant } from "@/context/TenantContext";
import {
  MapPin,
  Info,
  ArrowLeft,
  Navigation,
  MessageCircle,
  Smartphone, // Ícone que faltava
  Play, // Ícone que faltava
} from "lucide-react";
import Link from "next/link";

// Visualizador 360 carregado apenas no cliente (Browser)
const Visualizador360: any = dynamic(
  () => import("pannellum-react").then((mod) => mod.Pannellum),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-900 animate-pulse flex items-center justify-center text-white font-bold tracking-tighter">
        SIS<span className="text-indigo-400">MOB</span> 360°...
      </div>
    ),
  },
);

export default function ImovelDetalhes() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  // 1. ESTADOS
  const [imovel, setImovel] = useState<any>(null);
  const [gyroActive, setGyroActive] = useState(false); // Variável que faltava
  const viewMode = searchParams.get("view") || "tour";

  // 2. BUSCA DE DADOS
  useEffect(() => {
    if (tenant?.id) {
      api.get(`/imoveis`).then((res) => {
        const encontrou = res.data.find((i: any) => i.id === Number(id));
        if (!encontrou) {
          alert("Imóvel não encontrado.");
          router.push("/");
          return;
        }
        setImovel(encontrou);
      });
    }
  }, [id, tenant, router]);

  // 3. FUNÇÃO DE ATIVAÇÃO DOS SENSORES (O que faltava)
  const ativarGiroscopio = async () => {
    // Criamos uma referência 'any' para o evento, silenciando o TypeScript
    const DeviceOrientation = DeviceOrientationEvent as any;

    if (
      typeof DeviceOrientation !== "undefined" &&
      typeof DeviceOrientation.requestPermission === "function"
    ) {
      try {
        // Agora chamamos a função através da referência 'any'
        const permission = await DeviceOrientation.requestPermission();

        if (permission === "granted") {
          setGyroActive(true);
        } else {
          alert("A permissão para usar o movimento foi negada pelo iOS.");
        }
      } catch (error) {
        console.error("Erro ao solicitar sensores:", error);
      }
    } else {
      // Para Android, Windows e Mac, a permissão é automática
      setGyroActive(true);
    }
  };

  if (!imovel)
    return (
      <div className="p-20 text-center text-gray-400 font-bold">
        Carregando detalhes do imóvel...
      </div>
    );

  // Detecta a foto 360 na galeria
  const foto360 = imovel.midias?.find(
    (m: any) => m.tipo === "foto_360" || m.tipo === "foto360",
  )?.url;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 px-2 md:px-6">
      {/* 1. HEADER DINÂMICO */}
      <div className="flex items-center gap-4 py-4 px-2">
        <Link
          href="/"
          className="p-3 bg-white shadow-xl rounded-2xl border border-gray-100 active:scale-95 transition-all"
        >
          <ArrowLeft size={24} className="text-indigo-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 truncate leading-tight">
            {imovel.titulo}
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {imovel.tipo} • Código #{imovel.id}
          </p>
        </div>
      </div>

      {/* 2. CONTEÚDO (TOUR, VÍDEO OU MAPA) */}

      {viewMode === "tour" && (
        <div className="relative h-[75vh] md:h-[650px] w-full rounded-[3rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
          {foto360 ? (
            <>
              <Visualizador360
                width="100%"
                height="100%"
                image={foto360}
                autoLoad
                orientationOn={gyroActive}
                showFullscreenCtrl={false}
                mouseZoom={false}
              />

              {!gyroActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm px-6">
                  <button
                    onClick={ativarGiroscopio}
                    className="bg-white w-full max-w-sm p-8 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl active:scale-95 transition-all"
                  >
                    <div className="bg-indigo-600 p-5 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                      <Smartphone size={40} />
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-indigo-950 uppercase text-sm tracking-tighter">
                        Ativar Modo Imersivo
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold mt-1 block">
                        Mova o celular para olhar o imóvel
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white gap-4">
              <Info size={48} className="text-gray-600" />
              <p className="font-bold text-gray-400">
                Nenhum Tour 360 disponível.
              </p>
            </div>
          )}
        </div>
      )}

      {viewMode === "video" && imovel.videoUrl && (
        <div className="w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${
              imovel.videoUrl.includes("v=")
                ? imovel.videoUrl.split("v=")[1].split("&")[0]
                : imovel.videoUrl.split("/").pop()
            }`}
            title="Vídeo Drone"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}

      {viewMode === "map" && (
        <div className="bg-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl min-h-[60vh] relative overflow-hidden border-t-8 border-indigo-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 blur-[120px] opacity-20" />
          <div className="flex items-center gap-3 mb-10 relative">
            <Navigation className="text-indigo-400" />
            <h3 className="text-2xl font-black tracking-tight">
              Guia de Percurso
            </h3>
          </div>
          <div className="space-y-12 relative">
            {imovel.instrucoes?.length > 0 ? (
              imovel.instrucoes.map((ins: any, idx: number) => (
                <div key={ins.id} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg border border-indigo-400">
                      {idx + 1}
                    </div>
                    {idx !== imovel.instrucoes.length - 1 && (
                      <div className="w-0.5 h-12 bg-indigo-800 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="font-black text-indigo-200 uppercase text-xs tracking-widest">
                      {ins.titulo}
                    </h4>
                    <p className="text-gray-300 text-sm mt-1 leading-relaxed">
                      {ins.descricao}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-indigo-400 text-center py-20 italic font-medium">
                Nenhum percurso cadastrado.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-6 right-6 z-50">
        <button className="w-full bg-green-500 hover:bg-green-600 text-white p-6 rounded-[2.5rem] font-black text-lg flex justify-center items-center gap-4 shadow-xl transition-all active:scale-95">
          <MessageCircle size={32} />
          FALAR COM CONSULTOR
        </button>
      </div>
    </div>
  );
}
