"use client";
import { useState, useEffect } from "react";
import { Plus, Edit3, Mic, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function SismobListMaster({ config, papelUrl }: any) {
  const { tenant } = useTenant();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. GARANTIA DE COLUNAS (Evita o erro de .map)
  const columns =
    config?.columns && Array.isArray(config.columns)
      ? config.columns
      : [{ label: "Nome", key: "nome" }];

  useEffect(() => {
    const load = async () => {
      if (!tenant?.id || !config?.entity) return;
      setLoading(true);
      try {
        const res = await api.get(`/${config.entity}`, {
          params: { imobiliariaId: tenant.id, papel: config.papel },
        });
        // 2. GARANTIA DE DADOS
        const resultado = Array.isArray(res.data)
          ? res.data
          : res.data
            ? [res.data]
            : [];
        setData(resultado);
      } catch (e) {
        console.error("Erro na API:", e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant?.id, config?.entity, config?.papel]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          {config?.title || "Gestão"}
        </h1>
        <button
          onClick={() => router.push(`/gestao/${papelUrl}/manutencao`)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
        >
          INCLUIR NOVO
        </button>
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
                  SINCRONIZANDO DADOS...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-20 text-center text-slate-300 font-bold uppercase"
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
                  {columns.map((col: any) => (
                    <td key={col.key} className="p-8 font-bold text-slate-700">
                      {item[col.key] || "---"}
                    </td>
                  ))}
                  <td className="p-8 text-right">
                    <button
                      onClick={() =>
                        router.push(
                          `/gestao/${papelUrl}/manutencao?id=${item.id}`,
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
