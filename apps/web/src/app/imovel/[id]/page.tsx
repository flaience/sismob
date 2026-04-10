"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api"; // O nosso axios configurado
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
  const { id } = useParams();
  const router = useRouter();
  const { tenant } = useTenant(); // Descobre qual imobiliária é dona do site
  const [imovel, setImovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- O BLOCO QUE VOCÊ PERGUNTOU FICA AQUI ---
  useEffect(() => {
    async function carregarImovel() {
      // 1. Só tentamos buscar se o sistema já identificou a imobiliária pelo domínio
      if (!tenant?.id) return;

      try {
        console.log(`🔍 Buscando imóvel ${id} para a imobiliária ${tenant.id}`);

        // Buscamos os imóveis passando o ID da imobiliária como parâmetro
        const res = await api.get("/imoveis", {
          params: { imobiliariaId: tenant.id },
        });

        // 2. Procuramos na lista o imóvel que bate com o ID da URL
        const encontrou = res.data.find((i: any) => i.id === Number(id));

        if (!encontrou) {
          console.error(
            "❌ Imóvel não pertence a esta imobiliária ou não existe.",
          );
          router.push("/"); // Volta para a home se for um "invasor"
          return;
        }

        setImovel(encontrou);
      } catch (error) {
        console.error("❌ Falha ao carregar detalhes do imóvel:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarImovel();
  }, [id, tenant, router]); // Re-executa se o ID ou a Imobiliária mudarem
  // --- FIM DO BLOCO ---

  if (loading)
    return (
      <div className="p-20 text-center">Iniciando experiência imersiva...</div>
    );
  if (!imovel)
    return <div className="p-20 text-center">Imóvel não encontrado.</div>;

  const foto360 = imovel.midias?.find((m: any) => m.tipo === "foto_360")?.url;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* O RESTO DO SEU JSX BONITÃO VAI AQUI (Header, Pannellum, etc) */}
      <header className="flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 font-bold"
        >
          <ArrowLeft /> Voltar
        </Link>
        <h1 className="text-3xl font-black">{imovel.titulo}</h1>
      </header>
      {/* Área do Tour */}
      <div className="h-[600px] rounded-[3rem] overflow-hidden bg-black shadow-2xl border-8 border-white">
        {foto360 ? (
          <Visualizador360
            width="100%"
            height="100%"
            image={foto360}
            autoLoad
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white flex-col gap-4">
            <Info size={48} />
            <p>Nenhum Tour Virtual 360 disponível.</p>
          </div>
        )}
      </div>
      {/* Descrição e Percurso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm">
          <h3 className="text-xl font-bold mb-4">Descrição</h3>
          <p className="text-gray-600">{imovel.descricao}</p>
        </div>

        <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Navigation /> Como chegar
          </h3>
          {/* Map das instruções que já temos no banco */}
          {imovel.instrucoes?.map((ins: any, idx: number) => (
            <div key={ins.id} className="mb-6 flex gap-4">
              <div className="font-black opacity-30 text-3xl">{idx + 1}</div>
              <div>
                <p className="font-bold text-indigo-200">{ins.titulo}</p>
                <p className="text-xs opacity-70">{ins.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* SEÇÃO DE VÍDEO (DRONE) */}
      {imovel.videoUrl && (
        <div
          id="video"
          className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mt-8 scroll-mt-20"
        >
          <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
            <Play className="text-red-500" /> Experiência Aérea (Drone)
          </h2>

          <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border-4 border-white">
            <iframe
              className="w-full h-full"
              // CORREÇÃO DA URL: Adicionado o domínio do youtube e o interpolador ${}
              src={`https://www.youtube.com/embed/${
                imovel.videoUrl.includes("v=")
                  ? imovel.videoUrl.split("v=")[1].split("&")[0]
                  : imovel.videoUrl.split("/").pop()
              }`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
