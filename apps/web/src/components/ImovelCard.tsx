"use client";
import { useEffect, useState } from "react";
import {
  MapPin,
  Home,
  ZoomIn,
  Trash2,
  Camera,
  Map as MapIcon,
  Play,
  ChevronLeft,
  ChevronRight,
  Ruler,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { formatarMoeda, formatarMetragem } from "@/lib/utils"; // Importamos a unit de formatação

export default function ImovelCard({
  imovel,
  refresh,
}: {
  imovel: any;
  refresh: () => void;
}) {
  const [isOwner, setIsOwner] = useState(false);
  const [currentImg, setCurrentImg] = useState(0); // Estado para o carrossel
  const supabase = createClient();

  const imagens = imovel.midias || [];
  const temVideo = imovel.videoUrl || imovel.video_url;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });
  }, []);

  const nextImg = (e: any) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev + 1 === imagens.length ? 0 : prev + 1));
  };

  const prevImg = (e: any) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const handleDelete = async () => {
    if (!confirm("Deseja excluir este imóvel?")) return;
    try {
      await api.delete(`/imoveis/${imovel.id}`, {
        params: { imobiliariaId: imovel.imobiliariaId },
      });
      refresh();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl border border-gray-100 flex flex-col h-full relative overflow-hidden"
    >
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-8 right-8 z-30 p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* CARROSSEL DE IMAGENS */}
      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-indigo-50 shrink-0">
        <AnimatePresence mode="wait">
          {imagens.length > 0 ? (
            <motion.img
              key={currentImg}
              src={imagens[currentImg].url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="text-indigo-200" size={48} />
            </div>
          )}
        </AnimatePresence>

        {/* Controles do Carrossel (Só aparecem se houver mais de 1 foto) */}
        {imagens.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 z-20"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {imagens.map((_: any, i: number) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === currentImg ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* TEXTO E INFORMAÇÕES */}
      <div className="mt-6 flex-1 px-2">
        <h3 className="text-2xl font-black text-gray-900 mb-2 line-clamp-1">
          {imovel.titulo}
        </h3>

        {/* METRAGEM NO LUGAR DO TEXTO ANTIGO */}
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4">
          <Ruler size={16} />
          <span>{formatarMetragem(imovel.areaPrivativa)}</span>
          <span className="text-gray-300 ml-2">|</span>
          <span className="text-gray-400 font-medium ml-2 uppercase text-[10px] tracking-widest">
            {imovel.tipo}
          </span>
        </div>

        <div className="flex items-center text-gray-400 text-xs mb-6">
          <MapPin size={14} className="mr-1 text-indigo-500" />
          <span className="truncate">{imovel.enderecoOriginal}</span>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Valor do Imóvel
          </p>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">
            {formatarMoeda(imovel.precoVenda)}
          </span>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO (MODO VISUALIZAÇÃO ÚNICA) */}
      <div className="flex items-stretch gap-2 mt-auto h-14">
        <Link
          href={`/imovel/${imovel.id}?view=tour`}
          className="flex-[3] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <Camera size={18} /> TOUR 360°
        </Link>

        {temVideo && (
          <Link
            href={`/imovel/${imovel.id}?view=video`}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center transition-all"
          >
            <Play size={20} fill="currentColor" />
          </Link>
        )}

        <Link
          href={`/imovel/${imovel.id}?view=map`}
          className="flex-1 bg-gray-900 hover:bg-black text-white rounded-2xl flex items-center justify-center transition-all"
        >
          <MapIcon size={20} />
        </Link>
      </div>
    </motion.div>
  );
}
