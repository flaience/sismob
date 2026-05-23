"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

const ESTAGIOS = [
  { id: "proposta", label: "Proposta", color: "bg-blue-500" },
  { id: "analise", label: "Análise / Jurídico", color: "bg-purple-500" },
  { id: "contrato", label: "Minuta / Assinatura", color: "bg-orange-500" },
  { id: "concluido", label: "Vendido 🏁", color: "bg-emerald-500" },
];

export default function SismobKanban({ tenantId }: any) {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    api
      .get("/negociacoes", { params: { imobiliariaId: tenantId } })
      .then((res) => setCards(res.data));
  }, [tenantId]);

  return (
    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-10 px-4 -mx-4 md:mx-0 custom-scrollbar">
      {ESTAGIOS.map((col) => (
        <div
          key={col.id}
          className="snap-center flex-shrink-0 w-[85vw] md:w-[320px] bg-slate-100/50 p-6 rounded-[3rem] border border-slate-200/50"
        >
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="font-black text-slate-800 uppercase tracking-tighter">
              {col.label}
            </h3>
            <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
              {cards.filter((c) => c.status === col.id).length}
            </span>
          </div>

          <div className="space-y-4">
            {cards
              .filter((c) => c.status === col.id)
              .map((card) => (
                <motion.div
                  layoutId={card.id}
                  key={card.id}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg text-white ${col.color}`}
                    >
                      {card.intensidade}
                    </span>
                    <p className="text-[10px] font-bold text-slate-300">
                      #{card.id}
                    </p>
                  </div>
                  <h4 className="font-black text-slate-800 leading-tight mb-1">
                    {card.cliente_nome}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mb-4">
                    {card.imovel_titulo}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <p className="text-sm font-black text-indigo-600">
                      R$ {Number(card.valor_proposta).toLocaleString()}
                    </p>
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                      {card.corretor_nome?.charAt(0)}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
