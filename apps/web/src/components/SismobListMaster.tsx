"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit3, Mic, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function SismobListMaster({ config }: any) {
  const { tenant } = useTenant();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. BLINDAGEM DE COLUNAS: Se o mapa falhar, o site NÃO cai
  const columns = config?.columns || [
    { label: "Nome / Descrição", key: "nome" },
  ];

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id || !config?.entity) return;
      setLoading(true);
      try {
        const res = await api.get(`/${config.entity}`, {
          params: { imobiliariaId: tenant.id, papel: config.papel },
        });
        // 2. BLINDAGEM DE DADOS: Aceita objeto único ou lista
        const resultado = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        setData(resultado);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant?.id, config?.entity]);

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700">
      <header className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex justify-between items-center">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          {config?.title || "Gestão"}
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => alert(config?.aiMetadata)}
            className="bg-orange-50 text-orange-600 p-4 rounded-2xl animate-pulse"
          >
            <Mic />
          </button>
          <button
            onClick={() =>
              router.push(`${window.location.pathname}/manutencao`)
            }
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg"
          >
            INCLUIR NOVO
          </button>
        </div>
      </header>

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
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-20 text-center animate-pulse font-bold text-slate-300"
                >
                  CARREGANDO...
                </td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/30 transition-all"
                >
                  {columns.map((col: any) => (
                    <td key={col.key} className="p-8 font-bold text-slate-700">
                      {item[col.key] || "---"}
                    </td>
                  ))}
                  <td className="p-8 text-right">
                    <button
                      onClick={() =>
                        router.push(
                          `${window.location.pathname}/manutencao?id=${item.id}`,
                        )
                      }
                      className="p-3 bg-white border border-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
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
