"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  PlusCircle,
} from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { motion, AnimatePresence } from "framer-motion";
interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "date" | "detail";
  options?: { label: string; value: any }[]; // Para selects
  detailSchema?: Field[]; // Para Master/Detail
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [search, setSearch] = useState("");

  const loadData = async () => {
    if (!tenant?.id) return;
    try {
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
  }, [search, tenant]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, imobiliariaId: tenant.id };
      if (formData.id) await api.patch(`${endpoint}/${formData.id}`, payload);
      else await api.post(endpoint, payload);
      setIsModalOpen(false);
      loadData();
    } finally {
      setLoading(false);
    }
  };

  const openForm = (item = {}) => {
    setFormData(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER DINÂMICO */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900">{title}</h1>
        <div className="flex gap-4">
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="pl-6 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            onClick={() => openForm()}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* GRID PADRONIZADO */}
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
            {data.map((item: any) => (
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
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-red-600 bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORMULÁRIO MODAL (SERIALIZADO) */}
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
                      value={formData[field.name]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
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
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save />}{" "}
                SALVAR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
