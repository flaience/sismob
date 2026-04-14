"use client";
import { useState, useEffect } from "react";
import { UserPlus, Search, Mail, Phone, FileText, Users } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";

export default function ClientesPage() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();
  const router = useRouter();

  const fetchData = async () => {
    if (!tenant?.id) return;
    try {
      const res = await api.get("/pessoas", {
        params: { papel: "2", imobiliariaId: tenant.id },
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
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter text-green-600">
            Clientes
          </h1>
          <p className="text-gray-500 font-medium">
            Gestão de interessados e leads.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/pessoas/novo?papel=2")}
          className="bg-green-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all"
        >
          <UserPlus size={20} /> CADASTRAR NOVO
        </button>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          placeholder="Buscar cliente..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-green-600 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading &&
          lista.map((item: any) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 font-bold mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{item.nome}</h3>
              <div className="mt-4 space-y-2 text-gray-500 text-sm">
                <p className="flex items-center gap-2">
                  <Mail size={14} /> {item.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {item.telefone || "Sem fone"}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
