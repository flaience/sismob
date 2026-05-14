"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Bed,
  Bath,
  Maximize,
  MapPin,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/context/TenantContext";
import SismobAttributePicker from "@/components/SismobAttributePicker";
import PortalCardImovel from "@/components/PortalCardImovel";
import api from "@/lib/api";

export default function PortalVitrini() {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const [filtros, setFiltros] = useState<any>({
    tipo: "",
    cidade: "",
    precoMax: 5000000,
    atributos: [], // Array de IDs do cardápio
  });

  // FUNÇÃO MESTRE DE BUSCA
  const handleSearch = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const res = await api.get("/imoveis/portal/search", {
        params: { ...filtros, imobiliariaId: tenant.id },
      });
      setImoveis(res.data);
    } catch (e) {
      console.error("Erro na busca");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant?.id) handleSearch();
  }, [tenant?.id]);

  return (
    <div className="relative bg-[#F8F9FA] min-h-screen">
      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-[#F8F9FA]" />

        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter"
          >
            O lar dos seus <br /> <span className="text-brand">sonhos.</span>
          </motion.h1>
        </div>
      </section>

      {/* SUPER FILTRO INDUSTRIAL */}
      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-50">
        <div className="bg-white/90 backdrop-blur-3xl p-8 rounded-[4rem] shadow-2xl border border-white flex flex-wrap lg:flex-nowrap gap-6 items-center">
          <div className="flex-1 space-y-2 px-4 border-r border-slate-100">
            <label className="text-[10px] font-black uppercase text-brand tracking-widest flex items-center gap-2">
              <MapPin size={12} /> Localização
            </label>
            <input
              placeholder="Cidade ou Bairro"
              className="w-full bg-transparent font-bold text-lg outline-none"
              onChange={(e) =>
                setFiltros({ ...filtros, cidade: e.target.value })
              }
            />
          </div>

          <div className="flex-1 space-y-2 px-4 border-r border-slate-100">
            <label className="text-[10px] font-black uppercase text-brand tracking-widest flex items-center gap-2">
              <Sparkles size={12} /> Comodidades
            </label>
            <button
              onClick={() => setShowPicker(true)}
              className="w-full text-left font-bold text-lg text-slate-400 hover:text-brand transition-colors"
            >
              {filtros.atributos.length > 0
                ? `${filtros.atributos.length} Selecionados`
                : "O que é essencial?"}
            </button>
          </div>

          <div className="flex-1 space-y-2 px-4">
            <label className="text-[10px] font-black uppercase text-brand tracking-widest flex items-center gap-2">
              <DollarSign size={12} /> Até R${" "}
              {filtros.precoMax.toLocaleString()}
            </label>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="50000"
              onChange={(e) =>
                setFiltros({ ...filtros, precoMax: Number(e.target.value) })
              }
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-brand text-white p-8 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all"
          >
            <Search size={32} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* RESULTADOS */}
      <section className="max-w-7xl mx-auto py-20 px-10">
        {loading ? (
          <div className="flex justify-center p-20 animate-pulse font-black text-slate-300 uppercase tracking-widest">
            Cruzando dados...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {imoveis.map((imovel) => (
              <PortalCardImovel key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </section>

      {/* MODAL DE ATRIBUTOS (REUSADO DO ADMIN) */}
      {showPicker && (
        <SismobAttributePicker
          tenantId={tenant?.id}
          selectedIds={filtros.atributos}
          onClose={() => setShowPicker(false)}
          onConfirm={(ids: number[]) => {
            setFiltros({ ...filtros, atributos: ids });
            setShowPicker(false);
          }}
        />
      )}
    </div>
  );
}
