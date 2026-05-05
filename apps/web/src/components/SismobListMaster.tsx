"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Mic, Trash2, Search, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function SismobListMaster({ config, papelUrl }: any) {
  const { tenant } = useTenant();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 1. ESTADO DA BUSCA

  const columns = config?.columns || [{ label: "Nome", key: "nome" }];
  const endpoint = config?.entity;

  const loadData = useCallback(async () => {
    if (!tenant?.id || !endpoint) return;

    setLoading(true);
    try {
      const res = await api.get(`/${endpoint}`, {
        params: {
          imobiliariaId: tenant.id,
          papel: config.papel,
          search: searchTerm, // 2. ENVIA O TERMO PARA A API
        },
      });

      const resultado = Array.isArray(res.data)
        ? res.data
        : res.data
          ? [res.data]
          : [];
      setData(resultado);
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, endpoint, config.papel, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Confirmar exclusão?")) return;
    try {
      await api.delete(`/${endpoint}/${id}`, {
        params: { imobiliariaId: tenant?.id },
      });
      loadData();
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500); // 3. AGUARDA 500ms SEM DIGITAR PARA BUSCAR (ECONOMIA DE API)

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, loadData]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* HEADER INDUSTRIAL COM BUSCA INTEGRADA */}
      <header className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-1 min-w-[300px]">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {config?.title}
            </h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Fábrica de Dados Sismob
            </p>
          </div>

          {/* BARRA DE BUSCA INDUSTRIAL */}
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-4 top-3.5 text-slate-300"
              size={18}
            />
            <input
              type="text"
              placeholder={`Pesquisar em ${config?.title}...`}
              className="w-full pl-12 p-3 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 ring-indigo-600 outline-none transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Acionador Agente MCP */}
          <button
            onClick={() =>
              alert(
                `🤖 AGENTE IA: \n\n${config?.aiMetadata || "Iniciando treinamento do módulo..."}`,
              )
            }
            className="bg-orange-50 text-orange-600 p-3.5 rounded-2xl hover:scale-110 hover:bg-orange-600 hover:text-white transition-all shadow-sm group"
          >
            <Mic
              size={20}
              className="group-active:scale-90 transition-transform"
            />
          </button>

          <button
            onClick={() => router.push(`/gestao/${papelUrl}/manutencao`)}
            className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} /> INCLUIR
          </button>
        </div>
      </header>

      {/* GRID DE ALTA DENSIDADE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {columns.map((col: any) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-16 text-center animate-pulse text-slate-300 font-black uppercase tracking-tighter text-xl"
                >
                  Sincronizando com a Nuvem...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-16 text-center text-slate-300 font-bold uppercase italic"
                >
                  Nenhum registro encontrado no banco.
                </td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/20 transition-all group"
                >
                  {columns.map((col: any) => (
                    <td
                      key={col.key}
                      className="px-6 py-3 text-sm font-bold text-slate-600 group-hover:text-indigo-900"
                    >
                      {/* FORMATAÇÃO INTELIGENTE DE VALORES */}
                      {col.key.includes("preco") || col.key.includes("valor")
                        ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(Number(item[col.key] || 0))
                        : item[col.key] || "---"}
                    </td>
                  ))}

                  <td className="px-6 py-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() =>
                        router.push(
                          `/gestao/${papelUrl}/manutencao?id=${item.id}`,
                        )
                      }
                      className="p-2.5 text-indigo-600 bg-transparent hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-indigo-100"
                      title="Editar Registro"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 text-red-400 bg-transparent hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-none hover:shadow-lg hover:shadow-red-100"
                      title="Excluir Registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER DE CONTAGEM */}
      {!loading && data.length > 0 && (
        <div className="px-10 py-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Total de registros: {data.length}
          </p>
        </div>
      )}
    </div>
  );
}
