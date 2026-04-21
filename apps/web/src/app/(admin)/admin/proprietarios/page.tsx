"use client";
import { useState, useEffect } from "react";
import { Search, UserPlus, Edit3, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function GridPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const router = useRouter();
  const [lista, setLista] = useState([]);

  const fetchData = async () => {
    // SÓ BUSCA SE O TENANT ESTIVER CARREGADO
    if (!tenant?.id) return;

    try {
      const res = await api.get("/pessoas", {
        params: {
          papel: "3",
          imobiliariaId: tenant.id, // <--- O SEGREDO DOS DADOS APARECEREM
        },
      });
      setLista(res.data);
    } catch (e) {
      console.error("Erro ao carregar grid");
    }
  };

  useEffect(() => {
    if (!tenantLoading) fetchData();
  }, [tenant, tenantLoading]);

  const excluir = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await api.delete(`/pessoas/${id}`, {
      params: { imobiliariaId: tenant?.id },
    });
    fetchData(); // REFRESH IMEDIATO
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-indigo-600">Proprietários</h1>
        <button
          onClick={() => router.push(`/admin/pessoas/manutencao?papel=3`)}
          className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg"
        >
          <UserPlus />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {lista.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6 font-bold">{item.nome}</td>
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/pessoas/manutencao?id=${item.id}&papel=3`,
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
