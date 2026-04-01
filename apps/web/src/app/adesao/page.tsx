"use client";
import { useState } from "react";
import { Building2, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function AdesaoPage() {
  return (
    <div className="max-w-4xl mx-auto py-20">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">
          Turbine sua <span className="text-indigo-600">Imobiliária</span>
        </h1>
        <p className="text-gray-500 text-xl">
          Sua conta Admin será criada instantaneamente.
        </p>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-gray-100">
        <form className="space-y-8">
          {/* Seção Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-2">
                Nome da Imobiliária
              </label>
              <input
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Ex: Sismob Prime"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-2">
                CNPJ
              </label>
              <input
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          {/* Seção Gestor */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" /> Dados do Administrador
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Seu Nome Completo"
              />
              <input
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                placeholder="E-mail de Login"
              />
            </div>
          </div>

          <button className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
            CONCLUIR E ACESSAR PAINEL
            <ArrowRight size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
