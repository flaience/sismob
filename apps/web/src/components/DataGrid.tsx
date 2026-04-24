"use client";
import { Edit3, Trash2, Search, PlusCircle } from "lucide-react";

interface DataGridProps {
  title: string;
  data: any[];
  columns: { label: string; key: string; format?: (v: any) => any }[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSearch: (text: string) => void;
}

export default function DataGrid({
  title,
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  onSearch,
}: DataGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">{title}</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Pesquisa rápida..."
              className="pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
          <button
            onClick={onAdd}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all"
          >
            <PlusCircle size={24} />
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
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-indigo-50/30 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="p-6 font-medium text-gray-700">
                    {col.format ? col.format(item[col.key]) : item[col.key]}
                  </td>
                ))}
                <td className="p-6 text-right space-x-2">
                  <button
                    onClick={() => onEdit(item.id)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
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
