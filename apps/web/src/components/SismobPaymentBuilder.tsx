"use client";
import { Plus, Trash2, DollarSign, FileText } from "lucide-react";

export default function SismobPaymentBuilder({ value, onChange }: any) {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItem = { 
      id: Date.now(), 
      descricao: "", 
      valor: 0, 
      texto_contrato: "", // Ex: "Automóvel Honda Civic 2024, Placa ABC-1234"
      tipo: "entrada" 
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: number, key: string, val: any) => {
    onChange(items.map(i => i.id === id ? { ...i, [key]: val } : i));
  };

  return (
    <div className="w-full col-span-full space-y-6">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Estrutura de Pagamento</h3>
        <button type="button" onClick={addItem} className="bg-brand text-white px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
          <Plus size={14}/> ADICIONAR ITEM
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 animate-in zoom-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">Descrição da Verba</label>
                <input 
                  placeholder="Ex: Entrada, Permuta Carro, Parcelas" 
                  className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 ring-brand"
                  value={item.descricao} onChange={e => updateItem(item.id, 'descricao', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">Valor (R$)</label>
                <input 
                  type="number" placeholder="0,00"
                  className="w-full p-4 bg-white rounded-2xl border-none font-bold text-sm text-brand outline-none focus:ring-2 ring-brand"
                  value={item.valor} onChange={e => updateItem(item.id, 'valor', e.target.value)}
                />
              </div>
              <div className="flex items-end justify-center pb-2">
                <button type="button" onClick={() => onChange(items.filter(i => i.id !== item.id))} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
              </div>
              <div className="md:col-span-4">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-4 mb-2 block">Texto para o Contrato (Cláusula Jurídica)</label>
                <textarea 
                  placeholder="Descreva detalhadamente para o gerador de contratos..."
                  className="w-full p-4 bg-white rounded-2xl border-none font-medium text-xs h-24 outline-none focus:ring-2 ring-brand"
                  value={item.texto_contrato} onChange={e => updateItem(item.id, 'texto_contrato', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}