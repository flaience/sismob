"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit3, Mic, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";

export default function SismobListMaster({
  title,
  endpoint,
  columns,
  filters,
  onAdd,
  onEdit,
}: any) {
  const context = useTenant();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = context || { tenant: null };

  // 1. GARANTIA DE COLUNAS: Se não vier do mapa, usa o padrão para não dar erro de .map
  const colunasEfetivas =
    columns && Array.isArray(columns)
      ? columns
      : [
          { label: "Nome / Descrição", key: "nome" },
          { label: "E-mail / Registro", key: "email" },
        ];

  useEffect(() => {
    // 2. BLINDAGEM: Se não tem tenant (como no build da Vercel), não faz nada
    if (!tenant?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await api.get(endpoint, {
          params: { imobiliariaId: tenant.id, ...filters },
        });
        setData(
          Array.isArray(res.data) ? res.data : res.data ? [res.data] : [],
        );
      } catch (e) {
        console.error("Erro no Grid:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenant?.id, endpoint, JSON.stringify(filters)]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          {title}
        </h1>
        <div className="flex gap-4">
          <button className="bg-orange-50 text-orange-600 p-4 rounded-2xl hover:scale-110 transition-all">
            <Mic size={24} />
          </button>
          <button
            onClick={onAdd}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2"
          >
            <Plus size={20} /> NOVO
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {/* 3. O MAP PROTEGIDO */}
              {colunasEfetivas.map((col: any) => (
                <th
                  key={col.key}
                  className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  {col.label}
                </th>
              ))}
              <th className="p-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan={colunasEfetivas.length + 1}
                  className="p-20 text-center animate-pulse font-bold text-slate-300"
                >
                  CARREGANDO DADOS...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={colunasEfetivas.length + 1}
                  className="p-20 text-center font-bold text-slate-300 uppercase"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/30 transition-all group"
                >
                  {colunasEfetivas.map((col: any) => (
                    <td key={col.key} className="p-8 font-bold text-slate-700">
                      {item[col.key] || "---"}
                    </td>
                  ))}
                  <td className="p-8 text-right space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-3 bg-white border border-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
