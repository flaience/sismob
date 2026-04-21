"use client";
import { useState, useEffect } from "react";
import { Search, UserPlus, Edit3, Trash2, Target } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

const TITULO = "Interessados (Leads)";
const PAPEL = "2";

export default function GridLeadsPage() {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading) fetchData();
  }, [tenant, tenantLoading, search]);

  const excluir = async (id: string) => {
    if (!confirm("Remover lead?")) return;
    await api.delete(`/pessoas/${id}`, {
      params: { imobiliariaId: tenant?.id },
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-orange-600 flex items-center gap-3">
          <Target size={32} /> {TITULO}
        </h1>
        <div className="flex gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar Lead..."
            className="pl-6 pr-4 py-3 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-orange-600"
          />
          <button
            onClick={() => router.push(`/pessoas/manutencao?papel=${PAPEL}`)}
            className="bg-orange-600 text-white p-4 rounded-2xl shadow-lg hover:bg-orange-700"
          >
            <UserPlus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {lista.map((item: any) => (
              <tr
                key={item.id}
                className="hover:bg-orange-50/30 transition-colors"
              >
                <td className="p-6 font-bold">
                  {item.nome} <br />
                  <span className="text-xs font-normal text-gray-400">
                    {item.email}
                  </span>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/pessoas/manutencao?id=${item.id}&papel=${PAPEL}`,
                      )
                    }
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => excluir(item.id)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
