"use client";
import { useState } from "react";
import { Search, Bed, Bath, Maximize, MapPin, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalVitrini() {
  const [filtros, setFiltros] = useState({
    tipo: "",
    quartos: "",
    preco: 500000,
  });

  return (
    <div className="relative">
      {/* HERO SECTION - O IMPACTO */}
      <section className="relative h-[90vh] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Luxury House"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#F8F9FA]" />

        <div className="relative z-10 text-center space-y-6 px-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter"
          >
            Seu novo lar, <br />{" "}
            <span className="text-indigo-400">sob medida.</span>
          </motion.h1>
          <p className="text-white/70 text-xl font-medium max-w-2xl mx-auto">
            Encontre mansões, apartamentos e terrenos com a curadoria exclusiva
            Sismob.
          </p>
        </div>
      </section>

      {/* SUPER FORMULÁRIO DE CONSULTA (A MÁGICA QUE VOCÊ PEDIU) */}
      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-20">
        <div className="bg-white/80 backdrop-blur-3xl p-8 rounded-[4rem] shadow-2xl border border-white flex flex-wrap lg:flex-nowrap gap-8 items-center">
          <div className="flex-1 space-y-3 px-4 border-r border-gray-100">
            <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
              <MapPin size={12} /> Localização
            </label>
            <input
              placeholder="Cidade ou Bairro"
              className="w-full bg-transparent font-bold text-lg outline-none"
            />
          </div>

          <div className="flex-1 space-y-3 px-4 border-r border-gray-100">
            <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
              <Bed size={12} /> Dormitórios
            </label>
            <select className="w-full bg-transparent font-bold text-lg outline-none appearance-none">
              <option value="">Qualquer qto</option>
              <option value="2">2+ Quartos</option>
              <option value="3">3+ Quartos</option>
              <option value="4">4+ Quartos</option>
            </select>
          </div>

          <div className="flex-1 space-y-3 px-4">
            <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
              <DollarSign size={12} /> Orçamento máximo
            </label>
            <input
              type="range"
              min="100000"
              max="5000000"
              step="50000"
              onChange={(e) =>
                setFiltros({ ...filtros, preco: Number(e.target.value) })
              }
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between font-bold text-xs text-gray-500">
              <span>100k</span>
              <span className="text-indigo-600">
                R$ {filtros.preco.toLocaleString()}
              </span>
              <span>5M+</span>
            </div>
          </div>

          <button className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all">
            <Search size={32} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* VITRINE DE IMÓVEIS (A SER ALIMENTADA PELO ADMIN) */}
      <section className="max-w-7xl mx-auto py-32 px-10">
        <h2 className="text-4xl font-black tracking-tighter mb-12 uppercase italic">
          Lançamentos <span className="text-indigo-600">Sismob</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Aqui entrará o seu .map de imóveis vindo da API */}
          <div className="bg-white rounded-[4rem] p-4 shadow-sm border border-gray-100">
            <div className="h-80 bg-gray-200 rounded-[3.5rem] mb-8 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-6 pb-6">
              <h3 className="text-2xl font-black tracking-tighter mb-4">
                Casa no Bosque
              </h3>
              <div className="flex gap-4 text-gray-400 font-bold text-xs">
                <span className="flex items-center gap-1">
                  <Bed size={14} /> 4
                </span>
                <span className="flex items-center gap-1">
                  <Bath size={14} /> 3
                </span>
                <span className="flex items-center gap-1">
                  <Maximize size={14} /> 350m²
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
