"use client";
import { useEffect, useState } from "react";
import {
  MapPin,
  Home,
  ZoomIn,
  Trash2,
  Ruler,
  Camera,
  Map as MapIcon,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import { createClient } from "@/lib/supabase";

export default function ImovelCard({
  imovel,
  refresh,
}: {
  imovel: any;
  refresh: () => void;
}) {
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });
  }, []);

  const handleDelete = async () => {
    if (!confirm("Deseja excluir este imóvel?")) return;
    try {
      await api.delete(`/imoveis/${imovel.id}`, {
        params: { imobiliariaId: imovel.imobiliariaId },
      });
      if (refresh) refresh();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const imagemCapa =
    imovel.midias?.find((m: any) => m.isCapa)?.url || imovel.midias?.[0]?.url;

  // GARANTIA DE DADOS: Verifica o vídeo em qualquer formato de nome
  const temVideo = imovel.videoUrl || imovel.video_url;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl border border-gray-100 flex flex-col h-full relative overflow-hidden"
    >
      {/* BOTÃO DE DELEÇÃO (FLUTUANTE) */}
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-8 right-8 z-30 p-3 bg-red-500/90 backdrop-blur text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* IMAGEM */}
      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-indigo-50 shrink-0">
        {imagemCapa ? (
          <img
            src={imagemCapa}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt=""
          />
        ) : (
          <Home className="absolute inset-0 m-auto text-indigo-200 w-16 h-16" />
        )}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-indigo-600 shadow-sm">
            {imovel.tipo}
          </span>
        </div>
      </div>

      {/* TEXTO */}
      <div className="mt-6 flex-1 px-2">
        <h3 className="text-2xl font-black text-gray-900 mb-2 line-clamp-1">
          {imovel.titulo}
        </h3>
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <MapPin size={14} className="mr-1.5 text-indigo-500 shrink-0" />
          <span className="truncate">{imovel.enderecoOriginal}</span>
        </div>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-indigo-600 font-bold">R$</span>
          <span className="text-3xl font-black text-gray-900">
            {Number(imovel.precoVenda).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {/* 3. BARRA DE AÇÕES (ESTABILIZADA) */}
      <div className="flex items-stretch gap-2 mt-auto h-14">
        {/* BOTÃO TOUR - Sempre ocupa o maior espaço */}
        <Link
          href={`/imovel/${imovel.id}`}
          className="flex-[3] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 uppercase"
        >
          <Camera size={18} /> TOUR 360°
        </Link>

        {/* BOTÃO VÍDEO - Só aparece se houver link */}
        {temVideo && (
          <Link
            href={`/imovel/${imovel.id}#video`}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all shadow-lg flex items-center justify-center"
          >
            <Play size={20} fill="currentColor" />
          </Link>
        )}

        {/* BOTÃO LOGÍSTICA - Sempre pequeno no canto */}
        <button
          className="flex-1 bg-gray-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg flex items-center justify-center"
          title="Ver percurso"
        >
          <MapIcon size={20} />
        </button>
      </div>
    </motion.div>
  );
}
