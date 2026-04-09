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
  refresh?: () => void;
}) {
  const [isOwner, setIsOwner] = useState(false);
  const supabase = createClient();

  // Verifica se existe um usuário logado para mostrar o ícone de lixo
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });
  }, []);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este imóvel permanentemente?"))
      return;

    try {
      await api.delete(`/imoveis/${imovel.id}`);
      alert("Imóvel removido!");
      if (refresh) refresh(); // Atualiza a lista na home
    } catch (error) {
      alert("Erro ao excluir imóvel. Verifique suas permissões.");
    }
  };

  const imagemCapa =
    imovel.midias?.find((m: any) => m.isCapa)?.url || imovel.midias?.[0]?.url;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl border border-gray-100 flex flex-col h-full relative"
    >
      {/* BOTÃO DE DELEÇÃO (SÓ APARECE SE LOGADO) */}
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-8 right-8 z-30 p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-95"
        >
          <Trash2 size={18} />
        </button>
      )}

      {/* 1. CONTAINER DA IMAGEM */}
      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-indigo-50">
        {imagemCapa ? (
          <img
            src={imagemCapa}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <Home className="absolute inset-0 m-auto text-indigo-200 w-16 h-16" />
        )}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-indigo-600 shadow-sm">
            {imovel.tipo}
          </span>
        </div>
      </div>

      {/* 2. CONTEÚDO */}
      <div className="mt-6 flex-1 px-2">
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          {imovel.titulo}
        </h3>
        <div className="flex items-center text-gray-400 text-sm mb-4 italic">
          <MapPin size={14} className="mr-1.5 text-indigo-500" />{" "}
          {imovel.enderecoOriginal}
        </div>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-indigo-600 font-bold">R$</span>
          <span className="text-3xl font-black text-gray-900">
            {Number(imovel.precoVenda).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {/* 3. BOTÕES DE DIFERENCIAL */}
      <div className="flex gap-3 mt-auto">
        <Link
          href={`/imovel/${imovel.id}`}
          className="flex-[3] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100"
        >
          <Camera size={18} /> TOUR VIRTUAL 360°
        </Link>
        <button className="flex-1 bg-gray-900 text-white p-4 rounded-2xl hover:bg-black transition-all">
          <MapIcon size={20} />
        </button>
      </div>
    </motion.div>
  );
}
