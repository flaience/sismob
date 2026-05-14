"use client";
import {
  BedDouble,
  Bath,
  Maximize,
  Camera,
  PlayCircle,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PortalCardImovel({ imovel }: any) {
  // Tratamento de preço para não dar erro de string
  const preco = Number(imovel.preco_venda || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer flex flex-col h-full"
    >
      {/* IMAGEM E TAGS */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={
            imovel.capa_url ||
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
          }
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          alt={imovel.titulo}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* SELOS DE DIFERENCIAL */}
        <div className="absolute top-6 left-6 flex gap-2">
          {imovel.tour_360_url && (
            <span className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg">
              <Camera size={18} />
            </span>
          )}
          {imovel.video_url && (
            <span className="bg-red-600 text-white p-3 rounded-2xl shadow-lg">
              <PlayCircle size={18} />
            </span>
          )}
        </div>

        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900">
          {imovel.tipo}
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-10 flex-1 flex flex-col">
        <div className="mb-6">
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 leading-tight line-clamp-2 uppercase">
            {imovel.titulo}
          </h3>
          <p className="text-slate-400 font-bold text-xs flex items-center gap-1 mt-2">
            <MapPin size={14} className="text-indigo-500" />
            {imovel.bairro} • {imovel.cidade}
          </p>
        </div>

        {/* ICONES DE ESTRUTURA (Vindo do seu Schema) */}
        <div className="flex justify-between items-center mt-auto pt-6 border-t border-slate-50">
          <div className="flex gap-4 text-slate-400">
            <div className="flex items-center gap-1">
              <BedDouble size={16} />
              <span className="font-bold text-xs">{imovel.quartos || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span className="font-bold text-xs">{imovel.banheiros || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize size={16} />
              <span className="font-bold text-xs">
                {imovel.area_privativa || 0}m²
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-indigo-600 font-black text-xl tracking-tighter">
              {preco}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
