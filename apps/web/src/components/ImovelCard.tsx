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
  Star,
} from "lucide-react"; // 1. Ícones Web
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link"; // 2. Link Web (NUNCA expo-router)
import api from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { formatarMoeda, formatarMetragem } from "@/lib/utils";

export default function ImovelCard({
  imovel,
  refresh,
}: {
  imovel: any;
  refresh: () => void;
}) {
  const [isOwner, setIsOwner] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
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
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1 === imagens.length ? 0 : prev + 1));
  };

  const prevImg = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const handleDelete = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Deseja excluir este imóvel?")) return;
    try {
      await api.delete(`/imoveis/${imovel.id}`, {
        params: {
          imobiliariaId: imovel.imobiliaria_id || imovel.imobiliariaId,
        },
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

      {/* CARROSSEL */}
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

        {imagens.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 p-2 rounded-full text-white z-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 p-2 rounded-full text-white z-20"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className="mt-6 flex-1 px-2">
        <h3 className="text-2xl font-black text-gray-900 mb-2 line-clamp-1">
          {imovel.titulo}
        </h3>

        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4">
          <Ruler size={16} />
          <span>{formatarMetragem(imovel.areaPrivativa)}</span>
        </div>

        <div className="flex items-center text-gray-400 text-xs mb-6">
          <MapPin size={14} className="mr-1 text-indigo-500" />
          <span className="truncate">{imovel.enderecoOriginal}</span>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            Valor
          </p>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">
            {formatarMoeda(imovel.precoVenda)}
          </span>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex items-stretch gap-2 mt-auto h-14">
        <Link
          href={`/imovel/${imovel.id}?view=tour`}
          className="flex-[3] bg-indigo-600 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 uppercase transition-all shadow-lg"
        >
          <Camera size={18} /> TOUR 360°
        </Link>

        {temVideo && (
          <Link
            href={`/imovel/${imovel.id}?view=video`}
            className="flex-1 bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg"
          >
            <Play size={20} fill="currentColor" />
          </Link>
        )}

        <Link
          href={`/imovel/${imovel.id}?view=map`}
          className="flex-1 bg-gray-900 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg"
        >
          <MapIcon size={20} />
        </Link>
      </div>
    </motion.div>
  );
}
