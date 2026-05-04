"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Mic, Loader2, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function SismobListMaster({ config, papelUrl }: any) {
  const { tenant } = useTenant();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. MAPEAMENTO DE VARIÁVEIS DO CONFIG
  const columns =
    config?.columns && Array.isArray(config.columns)
      ? config.columns
      : [{ label: "Nome", key: "nome" }];

  const endpoint = config?.entity; // Ex: "pessoas" ou "imoveis"

  // 2. FUNÇÃO DE CARGA (loadData) - Centralizada para ser reutilizada no refresh
  const loadData = useCallback(async () => {
    if (!tenant?.id || !endpoint) return;

    setLoading(true);
    try {
      const res = await api.get(`/${endpoint}`, {
        params: {
          imobiliariaId: tenant.id,
          papel: config.papel, // Se for o caso de pessoas
        },
      });

      // Garantia de dados em formato de array
      const resultado = Array.isArray(res.data)
        ? res.data
        : res.data
          ? [res.data]
          : [];
      setData(resultado);
    } catch (e) {
      console.error("❌ [SISMOB] Erro ao carregar dados:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id, endpoint, config.papel]);

  // 3. FUNÇÃO DE EXCLUSÃO (handleDelete)
  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ Deseja excluir este registro permanentemente?")) return;

    try {
      // Chamada industrial passando o tenantId por segurança
      await api.delete(`/${endpoint}/${id}`, {
        params: { imobiliariaId: tenant?.id },
      });

      // Refresh automático após deletar
      loadData();
    } catch (error) {
      alert("Erro ao excluir registro. Verifique as dependências.");
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER INDUSTRIAL */}
      <header className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            {config?.title || "Gestão"}
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Painel de Controle • {tenant?.nome_conta}
          </p>
        </div>

        <div className="flex gap-4">
          {/* Botão de Ajuda IA (MCP) */}
          <button
            onClick={() =>
              alert(
                `🤖 AGENTE SISMOB: \n\n${config.aiMetadata || "Sem instruções adicionais."}`,
              )
            }
            className="bg-orange-50 text-orange-600 p-4 rounded-2xl hover:scale-110 transition-all shadow-sm"
          >
            <Mic size={24} />
          </button>

          <button
            onClick={() => router.push(`/gestao/${papelUrl}/manutencao`)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} /> INCLUIR NOVO
          </button>
        </div>
      </header>

      {/* GRID DE DADOS */}
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
                  SINCRONIZANDO COM A FÁBRICA...
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
                  <td className="p-8 text-right space-x-2">
                    {/* Botão Editar */}
                    <button
                      onClick={() =>
                        router.push(
                          `/gestao/${papelUrl}/manutencao?id=${item.id}`,
                        )
                      }
                      className="p-3 bg-white border border-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 size={18} />
                    </button>

                    {/* Botão Excluir (O que faltava) */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-white border border-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
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
