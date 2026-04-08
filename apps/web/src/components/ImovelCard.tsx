"use client";
import Image from "next/image";
import {
  MapPin,
  Home,
  ZoomIn,
  Heart,
  Ruler,
  Camera,
  Map as MapIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ImovelCardProps {
  imovel: {
    id: number;
    titulo: string;
    tipo: string;
    status: string;
    enderecoOriginal: string;
    areaPrivativa: string;
    precoVenda: string;
    midias?: { url: string; isCapa: boolean }[];
  };
}

export default function ImovelCard({ imovel }: ImovelCardProps) {
  // Busca a imagem de capa ou usa a primeira disponível
  const imagemCapa =
    imovel.midias?.find((m) => m.isCapa)?.url || imovel.midias?.[0]?.url;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
    >
      {/* 1. CONTAINER DA IMAGEM */}

      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-indigo-50">
        {imagemCapa ? (
          <Image
            src={imagemCapa}
            alt={imovel.titulo}
            fill // Faz a imagem preencher o container
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            priority={false} // Carrega apenas quando necessário (Lazy Load)
            placeholder="blur" // Mostra um borrão enquanto carrega
            blurDataURL="data:image/png;base64,..." // Miniatura minúscula
          />
        ) : (
          <Home className="absolute inset-0 m-auto text-indigo-200 w-16 h-16" />
        )}
      </div>
      {/* 2. CONTEÚDO INFORMATIVO */}
      <div className="mt-6 flex-1 px-2">
        <h3 className="text-2xl font-black text-gray-900 line-clamp-1 mb-2 tracking-tight">
          {imovel.titulo}
        </h3>

        <div className="flex items-center text-gray-400 text-sm mb-4">
          <MapPin size={14} className="mr-1.5 text-indigo-500 shrink-0" />
          <span className="truncate font-medium">
            {imovel.enderecoOriginal}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6 py-4 border-y border-gray-50 text-gray-500">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-50 rounded-lg">
              <Ruler size={16} className="text-indigo-400" />
            </div>
            <span className="text-xs font-bold text-gray-700">
              {imovel.areaPrivativa} m²
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Cód: #{imovel.id}
          </div>
        </div>

        {/* PREÇO */}
        <div className="mb-6">
          <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Valor de Venda
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-indigo-600 font-bold text-sm">R$</span>
            <span className="text-3xl font-black text-gray-900 tracking-tighter">
              {Number(imovel.precoVenda).toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
      </div>
      {/* 3. BOTÕES DE AÇÃO (OS DIFERENCIAIS) */}
      <div className="flex gap-3 mt-auto">
        <Link
          href={`/imovel/${imovel.id}`}
          className="flex-[3] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 group/btn"
        >
          <Camera
            size={18}
            className="group-hover/btn:rotate-12 transition-transform"
          />
          TOUR VIRTUAL 360°
        </Link>

        <button
          className="flex-1 bg-gray-900 hover:bg-black text-white p-4 rounded-2xl transition-all shadow-lg flex items-center justify-center"
          title="Como chegar ao imóvel"
        >
          <MapIcon size={20} />
        </button>
      </div>
    </motion.div>
  );
}
