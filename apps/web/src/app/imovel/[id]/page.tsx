//src/app/imovel/[id]/page.tsx
"use client"; // 1. Sempre a primeira linha

// 2. Imports de bibliotecas padrão
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { MapPin, Info, ArrowLeft, Navigation } from "lucide-react";

// 3. A CONSTANTE Pannellum FICA AQUI (Fora do componente principal)
// O 'as any' é o segredo para silenciar o erro de 'width' e 'height'
const Visualizador360: any = dynamic(
  () => import("pannellum-react").then((mod) => mod.Pannellum),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-900 animate-pulse flex items-center justify-center text-indigo-300 font-bold">
        PREPARANDO AMBIENTE 360°...
      </div>
    ),
  },
);

// 4. O componente principal da página
export default function ImovelDetalhes() {
  const { id } = useParams();
  const [imovel, setImovel] = useState<any>(null);

  useEffect(() => {
    // Busca o imóvel pelo ID usando a API do Railway
    api.get(`/imoveis`).then((res) => {
      const encontrou = res.data.find((i: any) => i.id === Number(id));
      setImovel(encontrou);
    });
  }, [id]);

  if (!imovel)
    return (
      <div className="p-20 text-center text-gray-400">
        Carregando experiência...
      </div>
    );

  // Busca a foto 360 na galeria (aquela que cadastramos com tipo foto_360)
  const foto360 = imovel.midias?.find((m: any) => m.tipo === "foto_360")?.url;

  return (
    <div className="relative h-[600px] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-900">
      {foto360 ? (
        /* @ts-ignore - Ignora a validação rígida de props do React 19 para esta biblioteca */
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
        <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-4">
          <Info size={48} />
          <p>Este imóvel não possui tour virtual disponível.</p>
        </div>
      )}
    </div>
  );
}
