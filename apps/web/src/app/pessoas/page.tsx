//src/app/pessoas/page.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, Mail, Phone, FileText, UserCheck } from "lucide-react";

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    documento: "",
    telefone: "",
    tipo: "fisica",
    isCorretor: false,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const fetchPessoas = async () => {
    const res = await axios.get(`${apiUrl}/pessoas`);
    setPessoas(res.data);
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${apiUrl}/pessoas`, formData);
    setFormData({
      nome: "",
      email: "",
      documento: "",
      telefone: "",
      tipo: "fisica",
      isCorretor: false,
    });
    fetchPessoas();
    alert("Pessoa cadastrada com sucesso!");
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Gestão de Pessoas</h1>
        <p className="text-gray-500">
          Cadastre proprietários, inquilinos e corretores.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORMULÁRIO */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-4"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <UserPlus className="text-indigo-600" /> Novo Cadastro
          </h2>

          <input
            placeholder="Nome Completo"
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />

          <input
            placeholder="E-mail"
            type="email"
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="CPF/CNPJ"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
              value={formData.documento}
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
            />
            <input
              placeholder="Telefone"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
            />
          </div>

          <select
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
            value={formData.tipo}
            onChange={(e) =>
              setFormData({ ...formData, tipo: e.target.value as any })
            }
          >
            <option value="fisica">Pessoa Física</option>
            <option value="juridica">Pessoa Jurídica</option>
          </select>

          <label className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-indigo-600 rounded-lg"
              checked={formData.isCorretor}
              onChange={(e) =>
                setFormData({ ...formData, isCorretor: e.target.checked })
              }
            />
            <span className="text-sm font-bold text-indigo-700">
              É um Corretor?
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            SALVAR CADASTRO
          </button>
        </form>

        {/* LISTAGEM RÁPIDA */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-6">Pessoas Cadastradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pessoas.map((p: any) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
              >
                <div className="bg-gray-100 p-4 rounded-2xl text-gray-400">
                  {p.isCorretor ? (
                    <UserCheck className="text-green-500" />
                  ) : (
                    <FileText />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{p.nome}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail size={12} /> {p.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
