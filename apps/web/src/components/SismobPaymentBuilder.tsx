"use client";
import {
  Plus,
  Trash2,
  Car,
  Banknote,
  CalendarDays,
  FileText,
} from "lucide-react";

export default function SismobPaymentBuilder({ value, onChange }: any) {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      tipo: "entrada", // entrada, permuta, parcelas
      descricao: "",
      valor: 0,
      texto_contrato: "",
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: number, key: string, val: any) => {
    onChange(items.map((i) => (i.id === id ? { ...i, [key]: val } : i)));
  };

  const removeItem = (id: number) => onChange(items.filter((i) => i.id !== id));

  return (
    <div className="w-full col-span-full space-y-6">
      <div className="flex justify-between items-center px-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
          Composição do Negócio
        </h3>
        <button
          type="button"
          onClick={addItem}
          className="bg-brand text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={14} strokeWidth={3} /> Adicionar Verba
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 animate-in zoom-in duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">
                  Tipo de Verba
                </label>
                <select
                  className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm focus:ring-2 ring-brand outline-none"
                  value={item.tipo}
                  onChange={(e) => updateItem(item.id, "tipo", e.target.value)}
                >
                  <option value="entrada">Entrada (Dinheiro/Pix)</option>
                  <option value="permuta">Permuta (Carro/Imóvel)</option>
                  <option value="parcelas">Saldo Parcelado</option>
                  <option value="financiamento">Financiamento Bancário</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">
                  Título / Identificação
                </label>
                <input
                  placeholder="Ex: Sinal de reserva, Honda Civic 2024..."
                  className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm focus:ring-2 ring-brand outline-none"
                  value={item.descricao}
                  onChange={(e) =>
                    updateItem(item.id, "descricao", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full p-4 bg-white rounded-2xl border-none font-black text-sm text-brand focus:ring-2 ring-brand outline-none"
                  value={item.valor}
                  onChange={(e) => updateItem(item.id, "valor", e.target.value)}
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">
                  Texto para a Cláusula do Contrato (O Agente MCP usará este
                  campo)
                </label>
                <textarea
                  placeholder="Descreva aqui os detalhes: placa do veículo, número da matrícula, datas específicas..."
                  className="w-full p-5 bg-white rounded-[2rem] border-none font-medium text-xs h-24 focus:ring-2 ring-brand outline-none"
                  value={item.texto_contrato}
                  onChange={(e) =>
                    updateItem(item.id, "texto_contrato", e.target.value)
                  }
                />
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-3xl transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
          <p className="text-slate-300 font-bold italic">
            Nenhum item de pagamento definido para esta negociação.
          </p>
        </div>
      )}
    </div>
  );
}
