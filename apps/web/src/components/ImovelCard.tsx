"use client";
import { useEffect, useState } from "react";
import {
  MapPin,
  Home,
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
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase"; // 1. Importando o Singleton correto
import { formatarMoeda, formatarMetragem } from "@/lib/utils";

interface ImovelCardProps {
  imovel: any;
  refresh: () => void;
}

export default function ImovelCard({ imovel, refresh }: ImovelCardProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  const imagens = imovel.midias || [];
  const temVideo = imovel.videoUrl || imovel.video_url;

  useEffect(() => {
    // 2. Tipagem explícita no then para matar o erro TS(7031)
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setIsOwner(!!session?.user);
      });
  }, []);

  const nextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1 === imagens.length ? 0 : prev + 1));
  };

  const prevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Deseja excluir este imóvel?")) return;
    try {
      // Usamos o ID da imobiliária vindo do próprio objeto imovel
      await api.delete(`/imoveis/${imovel.id}`, {
        params: {
          imobiliariaId: imovel.tenant_id || imovel.tenantId,
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
      {/* Botão de Excluir - Só aparece para usuários logados */}
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-8 right-8 z-30 p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* CARROSSEL DE IMAGENS */}
      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-slate-50 shrink-0">
        <AnimatePresence mode="wait">
          {imagens.length > 0 ? (
            <motion.img
              key={currentImg}
              src={imagens[currentImg].url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full object-cover"
              alt={imovel.titulo}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Home className="text-slate-200" size={48} />
            </div>
          )}
        </AnimatePresence>

        {imagens.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white z-20 hover:bg-white/40"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white z-20 hover:bg-white/40"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* CONTEÚDO DO CARD */}
      <div className="mt-6 flex-1 px-2">
        <h3 className="text-2xl font-black text-slate-900 mb-2 line-clamp-1 tracking-tighter">
          {imovel.titulo}
        </h3>

        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4">
          <Ruler size={16} />
          <span>
            {formatarMetragem(imovel.area_privativa || imovel.areaPrivativa)}
          </span>
        </div>

        <div className="flex items-center text-slate-400 text-xs mb-6">
          <MapPin size={14} className="mr-1 text-indigo-500" />
          <span className="truncate">
            {imovel.endereco_original || imovel.enderecoOriginal}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Valor de Venda
          </p>
          <span className="text-3xl font-black text-slate-900 tracking-tighter">
            {formatarMoeda(imovel.preco_venda || imovel.precoVenda)}
          </span>
        </div>
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="flex items-stretch gap-2 mt-auto h-14">
        <Link
          href={`/imovel/${imovel.id}?view=tour`}
          className="flex-[3] bg-indigo-600 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 uppercase transition-all shadow-lg hover:bg-indigo-700"
        >
          <Camera size={18} /> TOUR 360°
        </Link>

        {temVideo && (
          <Link
            href={`/imovel/${imovel.id}?view=video`}
            className="flex-1 bg-red-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg hover:bg-red-600"
          >
            <Play size={20} fill="currentColor" />
          </Link>
        )}

        <Link
          href={`/imovel/${imovel.id}?view=map`}
          className="flex-1 bg-slate-900 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg hover:bg-black"
        >
          <MapIcon size={20} />
        </Link>
      </div>
    </motion.div>
  );
}
