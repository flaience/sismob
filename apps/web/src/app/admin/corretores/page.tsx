"use client";
import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Mail,
  Hash,
  Phone,
} from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

// --- AJUSTE ESTAS VARIÁVEIS PARA CADA PÁGINA ---
const TITULO = "Proprietários"; // Mude para Clientes ou Corretores
const PAPEL = "1"; // 3=Proprietário, 2=Cliente, 1=Corretor
const COR = "text-indigo-600"; // indigo, green ou blue
const BG_BOTAO = "bg-indigo-600";
// ----------------------------------------------

export default function GestaoPessoasPage() {
  const { tenant } = useTenant();
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(timer);
  }, [tenant, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm gap-6">
        <div>
          <h1 className={`text-3xl font-black ${COR}`}>{TITULO}</h1>
          <p className="text-gray-400 text-sm font-medium">
            Gestão multi-tenant Sismob
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 outline-none"
            />
          </div>
          <button
            onClick={() => router.push(`/admin/pessoas/novo?papel=${PAPEL}`)}
            className={`${BG_BOTAO} text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all`}
          >
            <UserPlus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Nome
              </th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest hidden md:table-cell">
                Documento
              </th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">
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
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{item.nome}</span>
                    <span className="text-xs text-gray-400">{item.email}</span>
                  </div>
                </td>
                <td className="p-6 hidden md:table-cell text-gray-500 font-mono text-sm">
                  {item.documento}
                </td>
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/pessoas/novo?id=${item.id}&papel=${PAPEL}`,
                      )
                    }
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Excluir?")) {
                        await api.delete(`/pessoas/${item.id}`);
                        fetchData();
                      }
                    }}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-300">
            Nenhum registro para esta busca.
          </div>
        )}
      </div>
    </div>
  );
}
