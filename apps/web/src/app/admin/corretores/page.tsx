"use client";
import { useState, useEffect } from "react";
import { UserPlus, Search, Mail, Phone, Briefcase } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function CorretoresPage() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();
  const router = useRouter();

  const fetchData = async () => {
    if (!tenant?.id) return;
    try {
      const res = await api.get("/pessoas", {
        params: { papel: "1", imobiliariaId: tenant.id },
      });
      setLista(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenant]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter text-blue-600">
            Corretores
          </h1>
          <p className="text-gray-500 font-medium">
            Equipe de vendas e administração.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/pessoas/novo?papel=1")}
          className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"
        >
          <UserPlus size={20} /> CADASTRAR NOVO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading &&
          lista.map((item: any) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold mb-4">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.nome}</h3>
              <p className="text-xs font-black text-blue-500 mt-1 uppercase tracking-widest">
                Equipe Sismob
              </p>
              <div className="mt-4 space-y-2 text-gray-500 text-sm">
                <p className="flex items-center gap-2">
                  <Mail size={14} /> {item.email}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
