"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit3, Trash2, Mic, Filter } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

export default function SismobListMaster({
  title,
  endpoint,
  columns,
  searchFields,
  onAdd,
  onEdit,
  filters: defaultFilters,
}: any) {
  const { tenant } = useTenant();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<any>({});

  const loadData = async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const res = await api.get(endpoint, {
        params: { imobiliariaId: tenant.id, ...defaultFilters, ...search },
      });
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER INDUSTRIAL COM PESQUISA DINÂMICA */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            {title}
          </h1>
          <div className="flex gap-3">
            <button className="bg-indigo-50 text-brand p-4 rounded-2xl hover:bg-brand hover:text-white transition-all">
              <Mic size={20} /> {/* Acionador da IA/MCP */}
            </button>
            <button
              onClick={onAdd}
              className="bg-brand text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus size={20} /> INCLUIR NOVO
            </button>
          </div>
        </div>

        {/* BARRA DE PESQUISA GERADA PELO MAPA */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
          {searchFields?.map((f: any) => (
            <input
              key={f.key}
              placeholder={`Filtrar por ${f.label}...`}
              className="flex-1 min-w-[200px] p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold outline-none focus:ring-2 ring-brand"
              onChange={(e) =>
                setSearch({ ...search, [f.key]: e.target.value })
              }
            />
          ))}
        </div>
      </div>

      {/* GRID DE RESULTADOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {columns.map((col: any) => (
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
            {data.map((item: any) => (
              <tr
                key={item.id}
                className="hover:bg-indigo-50/30 transition-colors group"
              >
                {columns.map((col: any) => (
                  <td key={col.key} className="p-8 font-bold text-slate-700">
                    {item[col.key] || "---"}
                  </td>
                ))}
                <td className="p-8 text-right space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-3 bg-white border border-slate-100 text-brand rounded-xl shadow-sm hover:bg-brand hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button className="p-3 bg-white border border-slate-100 text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && (
          <div className="p-20 text-center font-bold text-slate-300">
            Nenhum registro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
