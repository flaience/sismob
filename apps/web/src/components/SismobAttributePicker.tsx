"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import api from "@/lib/api";

export default function SismobAttributePicker({
  selectedIds,
  onConfirm,
  onClose,
  tenantId,
}: any) {
  const [data, setData] = useState<any[]>([]); // Categorias com Atributos
  const [tempSelection, setTempSelection] = useState<number[]>(
    selectedIds || [],
  );

  useEffect(() => {
    async function load() {
      // Busca categorias e atributos em paralelo
      const [resCat, resAttr] = await Promise.all([
        api.get("/configuracoes/categorias-atributos", {
          params: { imobiliariaId: tenantId },
        }),
        api.get("/configuracoes/atributos", {
          params: { imobiliariaId: tenantId },
        }),
      ]);

      // Agrupa Atributos dentro de suas Categorias (Lógica de Mestre)
      const categories = resCat.data.map((cat: any) => ({
        ...cat,
        itens: resAttr.data.filter((attr: any) => attr.categoria_id === cat.id),
      }));
      setData(categories);
    }
    load();
  }, [tenantId]);

  const toggle = (id: any) => {
    const numericId = Number(id); // <--- GARANTIA INDUSTRIAL
    setTempSelection((prev) =>
      prev.includes(numericId)
        ? prev.filter((x) => x !== numericId)
        : [...prev, numericId],
    );
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col">
        <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
              CARDÁPIO DE ATRIBUTOS
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Selecione os diferenciais do imóvel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-red-50 text-red-500 rounded-2xl transition-all"
          >
            <X />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {data.map((cat: any) => (
            <div key={cat.id} className="space-y-4">
              <h3 className="text-lg font-black text-indigo-600 border-l-4 border-indigo-600 pl-4 uppercase tracking-tighter">
                {cat.nome}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cat.itens.map((item: any) => {
                  const active = tempSelection.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${active ? "bg-indigo-600 border-indigo-400 shadow-lg" : "bg-slate-50 border-transparent hover:border-indigo-200"}`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-tighter ${active ? "text-white" : "text-slate-600"}`}
                      >
                        {item.quantidade}x {item.nome}
                      </span>
                      {active && (
                        <CheckCircle2 size={16} className="text-indigo-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm font-black text-slate-400 uppercase">
            {tempSelection.length} itens selecionados
          </span>
          <button
            onClick={() => onConfirm(tempSelection)}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all"
          >
            CONFIRMAR E SALVAR
          </button>
        </footer>
      </div>
    </div>
  );
}
