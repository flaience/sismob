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
  Smartphone,
} from "lucide-react";
import Link from "next/link";

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
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") || "tour";
  const { tenant } = useTenant();

  const [imovel, setImovel] = useState<any>(null);
  const [gyroActive, setGyroActive] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      console.log(`🔍 Buscando imóvel ID: ${id} para Tenant: ${tenant.id}`);

      api
        .get(`/imoveis`, { params: { imobiliariaId: tenant.id } })
        .then((res) => {
          // Busca flexível: tenta achar o imóvel na lista
          const encontrou = res.data.find(
            (i: any) => Number(i.id) === Number(id),
          );

          if (!encontrou) {
            console.error(
              "❌ Imóvel não encontrado na lista retornada pela API.",
            );
            console.log("📦 Lista recebida:", res.data);
            return;
          }

          console.log("✅ Imóvel carregado com sucesso:", encontrou.titulo);
          setImovel(encontrou);
        })
        .catch((err) => {
          console.error("❌ Erro na chamada da API:", err);
        });
    }
  }, [id, tenant]);

  const ativarGiroscopio = async () => {
    const DeviceOrientation = (window as any).DeviceOrientationEvent;
    if (
      typeof DeviceOrientation !== "undefined" &&
      typeof DeviceOrientation.requestPermission === "function"
    ) {
      const permission = await DeviceOrientation.requestPermission();
      if (permission === "granted") setGyroActive(true);
    } else {
      setGyroActive(true);
    }
  };

  if (!imovel)
    return (
      <div className="p-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-400 font-bold">
          Sincronizando experiência 360...
        </p>
        <p className="text-xs text-gray-300">
          Se demorar, verifique o console (F12)
        </p>
      </div>
    );

  // Busca a foto 360 de forma robusta
  const foto360 = imovel.midias?.find((m: any) =>
    String(m.tipo).toLowerCase().includes("360"),
  )?.url;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-24 px-2 md:px-6">
      <div className="flex items-center gap-4 py-2">
        <Link
          href="/"
          className="p-3 bg-white shadow-sm rounded-2xl border border-gray-100"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black text-gray-900 truncate">
          {imovel.titulo}
        </h1>
      </div>
      {viewMode === "tour" && (
        <div className="relative h-[75vh] md:h-[650px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
          {foto360 ? (
            <>
              <Visualizador360
                width="100%"
                height="100%"
                image={foto360}
                autoLoad
                orientationOn={gyroActive}
                showFullscreenCtrl={false}
              />
              {!gyroActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <button
                    onClick={ativarGiroscopio}
                    className="bg-white p-8 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl transition-all active:scale-95"
                  >
                    <div className="bg-indigo-600 p-5 rounded-[2rem] text-white">
                      <Smartphone size={40} />
                    </div>
                    <div className="text-center">
                      <span className="block font-black text-indigo-950 uppercase text-sm">
                        Ativar Modo Imersivo
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        Gire o celular para olhar o imóvel
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white gap-4">
              <Info size={48} className="text-gray-600" />
              <p className="text-gray-400">
                Aguardando processamento da foto 360...
              </p>
            </div>
          )}
        </div>
      )}
      // aqui
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
