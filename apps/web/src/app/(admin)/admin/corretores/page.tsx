"use client";
import { useState, useEffect } from "react";
import { Search, UserPlus, Edit3, Trash2, Briefcase } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

const TITULO = "Corretores";
const PAPEL = "1";

export default function GridCorretoresPage() {
  const { tenant, loading: tenantLoading } = useTenant();
  const router = useRouter();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!tenant?.id) return;
    try {
      const res = await api.get("/pessoas", {
        params: { papel: PAPEL, imobiliariaId: tenant.id },
      });
      setLista(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading) fetchData();
  }, [tenant, tenantLoading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-blue-600 flex items-center gap-3">
          <Briefcase size={32} /> {TITULO}
        </h1>
        <button
          onClick={() => router.push(`/pessoas/manutencao?papel=${PAPEL}`)}
          className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg"
        >
          <UserPlus size={24} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {lista.map((item: any) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="p-6">
                  <p className="font-bold text-gray-900">{item.nome}</p>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-tighter">
                    Corretor Sismob
                  </p>
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
                    onClick={async () => {
                      if (confirm("Remover acesso?")) {
                        await api.delete(`/pessoas/${item.id}`, {
                          params: { imobiliariaId: tenant?.id },
                        });
                        fetchData();
                      }
                    }}
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
