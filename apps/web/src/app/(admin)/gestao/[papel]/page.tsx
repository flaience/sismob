"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, UserPlus, Edit3, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { PAPEIS, PAPEIS_LABELS } from "@/lib/constants"; // Importando suas constantes

export default function GridUniversal() {
  const params = useParams();
  const router = useRouter();
  const { tenant, loading: tenantLoading } = useTenant();

  // 1. Pegamos o texto da URL (ex: "proprietarios")
  const slug = params.papel as string;

  // 2. Tradutor de URL para ID (Puxando das suas constantes)
  const tradutor: Record<string, string> = {
    equipe: PAPEIS.EQUIPE, // "1"
    leads: PAPEIS.INTERESSADO, // "2"
    proprietarios: PAPEIS.PROPRIETARIO, // "3"
    inquilinos: PAPEIS.INQUILINO, // "4"
    compradores: PAPEIS.CLIENTE_COMPRADOR, // "7"
  };

  // 3. Identificamos o ID real (ex: "3")
  const papelId = tradutor[slug];

  const [lista, setLista] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    if (!tenant?.id || !papelId) return;
    try {
      const res = await api.get("/pessoas", {
        params: { papel: papelId, search, imobiliariaId: tenant.id },
      });
      setLista(res.data);
    } catch (err) {
      console.error("Erro ao carregar lista", err);
    }
  };

  useEffect(() => {
    if (!tenantLoading) load();
  }, [slug, search, tenant, tenantLoading]);

  // Se o papel não existir no tradutor, mostramos erro
  if (!papelId)
    return <div className="p-10">Módulo "{slug}" não encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
          Listagem de{" "}
          <span className="text-indigo-600">
            {PAPEIS_LABELS[papelId as keyof typeof PAPEIS_LABELS]}
          </span>
        </h1>
        <button
          onClick={() =>
            router.push(`/gestao/${slug}/manutencao?papel=${papelId}`)
          }
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:scale-105 transition-all font-bold"
        >
          CADASTRAR NOVO
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                Nome / Registro
              </th>
              <th className="p-6 text-right text-[10px] font-black uppercase text-gray-400">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {lista.length === 0 ? (
              <tr>
                <td className="p-10 text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              lista.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-6 font-bold text-gray-800">{item.nome}</td>
                  <td className="p-6 text-right space-x-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/gestao/${slug}/manutencao?id=${item.id}&papel=${papelId}`,
                        )
                      }
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
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
