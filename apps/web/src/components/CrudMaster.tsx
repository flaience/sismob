"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { useTenantOperation } from "@/hooks/useTenantOperation";
import { motion } from "framer-motion";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "date" | "detail";
  options?: { label: string; value: any }[];
  detailSchema?: Field[];
}

interface CrudProps {
  title: string;
  endpoint: string;
  columns: { label: string; key: string }[];
  fields: Field[];
}

export default function CrudMaster({
  title,
  endpoint,
  columns,
  fields,
}: CrudProps) {
  const { tenant } = useTenant();
  const { canOperate, message } = useTenantOperation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [search, setSearch] = useState("");

  const blockedMessage = message || "Operação bloqueada para este tenant.";

  const loadData = async () => {
    if (!tenant?.id) return;

    try {
      setLoading(true);

      const res = await api.get(endpoint, {
        params: { imobiliariaId: tenant.id, search },
      });

      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, tenant?.id]);

  const assertCanOperate = () => {
    if (!canOperate) {
      alert(blockedMessage);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!assertCanOperate()) return;
    if (!tenant?.id) {
      alert("Tenant não identificado.");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData, imobiliariaId: tenant.id };

      if (formData.id) {
        await api.patch(`${endpoint}/${formData.id}`, payload);
      } else {
        await api.post(endpoint, payload);
      }

      setIsModalOpen(false);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!assertCanOperate()) return;

    const confirmed = confirm("Tem certeza que deseja excluir este registro?");

    if (!confirmed) return;

    setLoading(true);

    try {
      await api.delete(`${endpoint}/${item.id}`, {
        params: { imobiliariaId: tenant?.id },
      });

      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const openForm = (item = {}) => {
    if (!assertCanOperate()) return;

    setFormData(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {!canOperate && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest">
            Modo consulta
          </p>
          <p className="mt-1 text-sm font-bold">{blockedMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900">{title}</h1>

        <div className="flex gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar..."
              className="pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <button
            onClick={() => openForm()}
            disabled={!canOperate}
            className={`p-4 rounded-2xl shadow-lg transition-all ${
              canOperate
                ? "bg-indigo-600 text-white hover:scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-6 text-[10px] font-black uppercase text-gray-400"
                >
                  {col.label}
                </th>
              ))}
              <th className="p-6 text-right text-[10px] font-black uppercase text-gray-400">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-10 text-center text-gray-400 font-black uppercase tracking-widest"
                >
                  <Loader2 className="animate-spin mx-auto mb-3" />
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-10 text-center text-gray-400 font-bold"
                >
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              data.map((item: any) => (
                <tr
                  key={item.id}
                  className="hover:bg-indigo-50/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="p-6 font-bold text-gray-700">
                      {item[col.key]}
                    </td>
                  ))}

                  <td className="p-6 text-right space-x-2">
                    <button
                      onClick={() => openForm(item)}
                      disabled={!canOperate}
                      className={`p-2 rounded-lg ${
                        canOperate
                          ? "text-blue-600 bg-blue-50"
                          : "text-slate-300 bg-slate-100 cursor-not-allowed"
                      }`}
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={!canOperate}
                      className={`p-2 rounded-lg ${
                        canOperate
                          ? "text-red-600 bg-red-50"
                          : "text-slate-300 bg-slate-100 cursor-not-allowed"
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-black">
                {formData.id ? "Editar" : "Novo"} {title}
              </h2>

              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>

            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 ml-2 uppercase">
                    {field.label}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione...</option>

                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "detail" ? "text" : field.type}
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 bg-gray-50 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!canOperate || loading}
                className={`px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2 ${
                  canOperate
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save />}
                SALVAR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
