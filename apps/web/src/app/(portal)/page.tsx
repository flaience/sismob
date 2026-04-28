"use client";
import { Search, Home, MapPin, BedDouble, Bath, Maximize } from "lucide-react";
import { motion } from "framer-motion";

export default function PortalHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* SECTION HERO: O IMPACTO VISUAL */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Mansão de Luxo"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-6xl px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
              Encontre o seu <br />{" "}
              <span className="text-indigo-400">próximo capítulo.</span>
            </h1>

            {/* O SUPER FILTRO (A MÁGICA) */}
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-[3rem] shadow-2xl flex flex-wrap md:flex-nowrap items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-8 py-4 border-r border-gray-100">
                <Home className="text-indigo-600" />
                <select className="bg-transparent font-bold outline-none w-full">
                  <option>Tipo do Imóvel</option>
                  <option>Casa</option>
                  <option>Apartamento</option>
                  <option>Terreno</option>
                </select>
              </div>
              <div className="flex-1 flex items-center gap-3 px-8 py-4 border-r border-gray-100">
                <MapPin className="text-indigo-600" />
                <input
                  placeholder="Cidade ou Bairro"
                  className="bg-transparent font-bold outline-none w-full"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-8 py-4">
                <BedDouble className="text-indigo-600" />
                <select className="bg-transparent font-bold outline-none w-full">
                  <option>Quartos</option>
                  <option>2+ Quartos</option>
                  <option>4+ Quartos</option>
                </select>
              </div>
              <button className="bg-indigo-600 text-white p-6 rounded-[2.5rem] hover:scale-105 transition-all shadow-xl">
                <Search size={28} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LISTAGEM DE IMÓVEIS (VITRINE) */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tighter">
              Destaques da Semana
            </h2>
            <p className="text-gray-400 font-bold">
              Os melhores imóveis selecionados pela nossa IA.
            </p>
          </div>
          <button className="text-indigo-600 font-black uppercase text-sm border-b-2 border-indigo-600">
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3].map((item) => (
            <div key={item} className="group cursor-pointer">
              <div className="relative h-[400px] rounded-[3rem] overflow-hidden mb-6">
                <img
                  src={`https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1984`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full font-black text-xs uppercase">
                  Venda • R$ 1.200.000
                </div>
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter">
                Mansão Contemporânea em Jurerê
              </h3>
              <p className="text-gray-400 mb-4 font-medium">
                Florianópolis, SC
              </p>
              <div className="flex gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <BedDouble size={18} /> <span className="font-bold">4</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={18} /> <span className="font-bold">3</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize size={18} />{" "}
                  <span className="font-bold">250m²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
