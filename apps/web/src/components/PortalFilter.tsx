"use client";
import { useState, useEffect } from "react";
import { Search, Home, MapPin, DollarSign, Sparkles } from "lucide-react";
import SismobAttributePicker from "./SismobAttributePicker"; // Reusando o seu seletor!
import api from "@/lib/api";

export default function PortalFilter({ onSearch, tenantId }: any) {
  const [filtros, setFiltros] = useState<any>({
    tipo: "",
    cidade: "",
    precoMax: 5000000,
    atributos: [],
  });
  const [showAttrs, setShowAttrs] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-50">
      <div className="bg-white/90 backdrop-blur-3xl p-10 rounded-[4rem] shadow-2xl border border-white flex flex-wrap lg:flex-nowrap gap-8 items-center">
        {/* LOCALIZAÇÃO */}
        <div className="flex-1 space-y-3 px-4 border-r border-slate-100">
          <label className="text-[10px] font-black uppercase text-brand tracking-widest flex items-center gap-2">
            <MapPin size={12} /> Onde?
          </label>
          <input
            placeholder="Cidade ou Bairro"
            className="w-full bg-transparent font-bold text-lg outline-none"
            onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
          />
        </div>

        {/* TIPO DE IMÓVEL */}
        <div className="flex-1 space-y-3 px-4 border-r border-slate-100">
          <label className="text-[10px] font-black uppercase text-brand tracking-widest flex items-center gap-2">
            <Home size={12} /> Tipo
          </label>
          <select
            className="w-full bg-transparent font-bold text-lg outline-none appearance-none cursor-pointer"
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="casa">Casa</option>
            <option value="apto">Apartamento</option>
            <option value="terreno">Terreno</option>
            <option value="chacara">Chácara</option>
          </select>
        </div>

        {/* O REUSO: BOTÃO DE ATRIBUTOS */}
        <div className="flex-1 space-y-3 px-4 border-r border-slate-100">
          <label className="text-[10px] font-black uppercase text-brand tracking-widest flex items-center gap-2">
            <Sparkles size={12} /> Comodidades
          </label>
          <button
            onClick={() => setShowAttrs(true)}
            className="w-full text-left font-bold text-lg text-slate-400 hover:text-brand transition-colors"
          >
            {filtros.atributos?.length > 0
              ? `${filtros.atributos.length} Selecionados`
              : "O que é essencial?"}
          </button>
        </div>

        {/* BOTÃO DE BUSCA */}
        <button
          onClick={() => onSearch(filtros)}
          className="bg-brand text-white p-8 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all group"
        >
          <Search
            size={32}
            className="group-active:scale-90 transition-transform"
          />
        </button>
      </div>

      {/* MODAL DE ATRIBUTOS REUTILIZADO */}
      {showAttrs && (
        <SismobAttributePicker
          tenantId={tenantId}
          selectedIds={filtros.atributos}
          onClose={() => setShowAttrs(false)}
          onConfirm={(ids: number[]) => {
            setFiltros({ ...filtros, atributos: ids });
            setShowAttrs(false);
          }}
        />
      )}
    </div>
  );
}
