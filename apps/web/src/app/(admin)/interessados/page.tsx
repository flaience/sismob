"use client";
import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Target,
} from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function InteressadosPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!tenant?.id) return;
    try {
      const res = await api.get("/pessoas", {
        params: { papel: "2", imobiliariaId: tenant.id, search },
      });
      setLista(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading && tenant?.id) fetchData();
  }, [tenant, tenantLoading, search]);

  const excluir = async (id: string) => {
    if (!confirm("Remover interessado?")) return;
    await api.delete(`/pessoas/${id}`, {
      params: { imobiliariaId: tenant?.id },
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-black text-orange-600 flex items-center gap-3">
            <Target size={32} /> Interessados (Leads)
          </h1>
          <p className="text-gray-400 text-sm">
            Pessoas buscando imóveis no seu portal.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome ou CPF..."
            className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none"
          />
          <button
            onClick={() => router.push("/admin/pessoas/novo?papel=2")}
            className="bg-orange-600 text-white p-4 rounded-2xl shadow-lg"
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
              <th className="p-6 text-right text-[10px] font-black uppercase text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lista.map((item: any) => (
              <tr
                key={item.id}
                className="hover:bg-orange-50/30 transition-colors"
              >
                <td className="p-6">
                  <p className="font-bold text-gray-800">{item.nome}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail size={12} /> {item.email}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={12} /> {item.telefone}
                  </p>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() =>
                      router.push(`/admin/pessoas/novo?id=${item.id}&papel=2`)
                    }
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => excluir(item.id)}
                    className="p-2 text-red-600 bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-300 font-bold">
            Nenhum interessado encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
