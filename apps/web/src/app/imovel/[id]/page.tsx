"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api"; // O nosso axios configurado
import { useSearchParams } from "next/navigation"; // Importe isso
import { useTenant } from "@/context/TenantContext"; // O DNA da imobiliária
import dynamic from "next/dynamic";
import {
  MapPin,
  ArrowLeft,
  Navigation,
  MessageCircle,
  Info,
  Play,
} from "lucide-react";
import Link from "next/link";

// Visualizador 360 (Carregado apenas no navegador)
const Visualizador360: any = dynamic(
  () => import("pannellum-react").then((mod) => mod.Pannellum),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full bg-gray-900 animate-pulse" />
    ),
  },
);

export default function ImovelDetalhes() {
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view") || "tour"; // Pega o modo da URL (tour, video ou map)
  const { id } = useParams();
  const router = useRouter();
  const { tenant } = useTenant(); // Descobre qual imobiliária é dona do site
  const [imovel, setImovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Bloco de carregamento do Imóvel
  useEffect(() => {
    async function carregarImovel() {
      if (!tenant?.id) return;

      try {
        const res = await api.get("/imoveis", {
          params: { imobiliariaId: tenant.id },
        });

        const encontrou = res.data.find((i: any) => i.id === Number(id));

        if (!encontrou) {
          router.push("/");
          return;
        }

        setImovel(encontrou);
      } catch (error) {
        console.error("❌ Falha ao carregar detalhes:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarImovel();
  }, [id, tenant, router]);

  // 2. Bloco Inteligente de Scroll (O pulo do gato para o botão de vídeo)
  useEffect(() => {
    // Se a URL tem #video, pulamos para ele quase instantaneamente
    if (imovel && window.location.hash === "#video") {
      const timer = setTimeout(() => {
        const elemento = document.getElementById("video");
        if (elemento) {
          // 'auto' faz o pulo ser instantâneo, sem o deslize demorado
          elemento.scrollIntoView({ behavior: "auto" });
        }
      }, 100); // 100ms é imperceptível
      return () => clearTimeout(timer);
    }
  }, [imovel]);

  if (loading)
    return (
      <div className="p-20 text-center">Iniciando experiência imersiva...</div>
    );
  if (!imovel)
    return <div className="p-20 text-center">Imóvel não encontrado.</div>;

  const foto360 = imovel.midias?.find((m: any) => m.tipo === "foto_360")?.url;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-10 px-2 md:px-6">
      {/* HEADER SIMPLES */}
      <div className="flex items-center gap-4 py-2">
        <Link href="/" className="p-2 bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold truncate">{imovel.titulo}</h1>
      </div>

      {/* EXIBIÇÃO CONDICIONAL: MOSTRA APENAS O QUE FOI PEDIDO */}

      {viewMode === "tour" && (
        <div className="h-[75vh] md:h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl bg-black border-2 border-white">
          {foto360 ? (
            <Visualizador360
              width="100%"
              height="100%"
              image={foto360}
              autoLoad
            />
          ) : (
            <p className="text-white text-center mt-20">Tour não disponível</p>
          )}
        </div>
      )}

      {viewMode === "video" && imovel.videoUrl && (
        <div className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${imovel.videoUrl.includes("v=") ? imovel.videoUrl.split("v=")[1].split("&")[0] : imovel.videoUrl.split("/").pop()}`}
            allowFullScreen
          ></iframe>
        </div>
      )}

      {viewMode === "map" && (
        <div className="bg-indigo-900 text-white p-6 rounded-[2.5rem] shadow-xl min-h-[60vh]">
          <h3 className="text-xl font-black mb-8 flex items-center gap-2">
            <Navigation /> Como chegar
          </h3>
          <div className="space-y-8">
            {imovel.instrucoes?.map((ins: any, idx: number) => (
              <div key={ins.id} className="flex gap-4">
                <span className="text-3xl font-black opacity-20">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium">{ins.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTÃO DE CONTATO SEMPRE VISÍVEL NO RODAPÉ */}
      <button className="w-full bg-green-500 text-white p-6 rounded-[2rem] font-bold flex justify-center items-center gap-3">
        <MessageCircle /> Falar com corretor
      </button>
    </div>
  );
}
