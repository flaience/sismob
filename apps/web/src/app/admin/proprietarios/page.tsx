"use client";
import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  FileText,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import api from "@/lib/api";

export default function ProprietariosPage() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Carregar apenas os Proprietários (Papel 3)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`${apiUrl}/pessoas?papel=3`);
        setLista(res.data);
      } catch (e: any) {
        console.error("❌ ERRO NO FETCH:", e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Proprietários
          </h1>
          <p className="text-gray-500 font-medium">
            Gestão de donos de imóveis e parceiros.
          </p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <UserPlus size={20} />
          CADASTRAR NOVO
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          placeholder="Buscar por nome ou documento..."
          className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-600 outline-none"
        />
      </div>

      {/* GRID DE CARDS */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Carregando base de dados...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lista.map((item: any) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {item.nome.charAt(0)}
                </div>
                <button className="text-gray-300 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {item.nome}
              </h3>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
                {item.tipo === "f" ? "Pessoa Física" : "Pessoa Jurídica"}
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  {item.email}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  {item.telefone || "(Não informado)"}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm">
                  <FileText size={16} className="text-gray-400" />
                  {item.documento}
                </div>
              </div>

              <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 flex justify-center items-center gap-2 py-3 bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs transition-all">
                  <Edit size={14} /> EDITAR
                </button>
                <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lista.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400">
            Nenhum proprietário cadastrado para esta imobiliária.
          </p>
        </div>
      )}
    </div>
  );
}
