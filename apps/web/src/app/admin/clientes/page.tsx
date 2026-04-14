"use client";
import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Hash,
} from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

// --- CONFIGURAÇÃO DA ENTIDADE (Mude apenas aqui ao replicar) ---
const TITULO = "Clientes";
const PAPEL = "2";
// -------------------------------------------------------------

export default function ListagemPessoasPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!tenant?.id) return;
    try {
      const res = await api.get("/pessoas", {
        params: { papel: PAPEL, imobiliariaId: tenant.id, search },
      });
      setLista(res.data);
    } catch (e) {
      console.error("Erro ao buscar dados", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading) fetchData();
  }, [tenant, tenantLoading, search]);

  const excluir = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    try {
      await api.delete(`/pessoas/${id}`, {
        params: { imobiliariaId: tenant?.id },
      });
      fetchData(); // Atualiza a lista após excluir
    } catch (e) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 gap-4">
        <h1 className="text-3xl font-black text-gray-900">{TITULO}</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none"
            />
          </div>
          <button
            onClick={() => router.push(`/admin/pessoas/novo?papel=${PAPEL}`)}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg"
          >
            <UserPlus />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                Nome / E-mail
              </th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 hidden md:table-cell">
                Documento
              </th>
              <th className="p-6 text-right text-[10px] font-black uppercase text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lista.map((item: any) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="p-6">
                  <p className="font-bold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-400">{item.email}</p>
                </td>
                <td className="p-6 hidden md:table-cell text-gray-500 text-sm">
                  {item.documento}
                </td>
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/pessoas/novo?id=${item.id}&papel=${PAPEL}`,
                      )
                    }
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => excluir(item.id)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-300">
            Nenhum registro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
