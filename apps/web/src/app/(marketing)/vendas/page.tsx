"use client";
import { Camera, Map, ShieldCheck, Zap, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* HERO SECTION - O IMPACTO */}
      <section className="py-20 px-6 text-center max-w-5xl mx-auto">
        <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
          Lançamento Sismob v1.5
        </span>
        <h1 className="text-6xl font-black mt-8 leading-tight tracking-tighter">
          A primeira plataforma imobiliária com{" "}
          <span className="text-indigo-600">Tour 360 Nativo.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Elimine visitas improdutivas. Guie seu cliente até a porta do imóvel
          com nossa tecnologia de percurso e imersão total.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/adesao"
            className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            Começar 30 dias Grátis
          </Link>
          <button className="border border-slate-200 px-10 py-5 rounded-3xl font-bold text-lg hover:bg-slate-50">
            Ver Demonstração
          </button>
        </div>
      </section>

      {/* OS DIFERENCIAIS (TOP DAS GALÁXIAS) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm">
            <Camera className="text-indigo-600 mb-6" size={40} />
            <h3 className="text-2xl font-black mb-4">Tour 360° Nativo</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Não dependa de softwares caros. Suba suas fotos panorâmicas e crie
              tours imersivos em segundos.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm">
            <Map className="text-indigo-600 mb-6" size={40} />
            <h3 className="text-2xl font-black mb-4">Last Mile Logistics</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Seu cliente nunca mais vai se perder. Instruções visuais de
              percurso para chegar exatamente onde o imóvel está.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm">
            <Zap className="text-indigo-600 mb-6" size={40} />
            <h3 className="text-2xl font-black mb-4">Multi-empresa</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Gerencie várias filiais com um único painel. Controle total de
              corretores, clientes e comissões.
            </p>
          </div>
        </div>
      </section>

      {/* PLANOS (A CONTRATAÇÃO) */}
      <section className="py-20 max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-black text-center mb-16">
          Planos que crescem com você
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-2 border-slate-100 p-12 rounded-[4rem] hover:border-indigo-600 transition-all group">
            <h4 className="text-xl font-bold">Plano Start</h4>
            <p className="text-4xl font-black mt-4">
              R$ 199
              <span className="text-sm font-medium text-slate-400">/mês</span>
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-2 font-medium">
                <Check className="text-green-500" size={18} /> Até 50 Imóveis
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Check className="text-green-500" size={18} /> Tour Virtual
                Ilimitado
              </li>
              <li className="flex items-center gap-2 font-medium">
                <Check className="text-green-500" size={18} /> 1 Unidade de
                Negócio
              </li>
            </ul>
            <Link
              href="/adesao"
              className="mt-10 block text-center bg-slate-900 text-white py-5 rounded-2xl font-black group-hover:bg-indigo-600 transition-all"
            >
              CONTRATAR AGORA
            </Link>
          </div>
          {/* Adicione o Plano Premium aqui */}
        </div>
      </section>
    </div>
  );
}
