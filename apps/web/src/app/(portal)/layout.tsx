"use client";
import Link from "next/link";
import { Home, User } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-indigo-100 selection:text-indigo-700">
      {/* NAVBAR TRANSPARENTE E MODERNA */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-between items-center max-w-7xl mx-auto pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/20"
        >
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Home size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase text-slate-900">
              SIS<span className="text-indigo-600">MOB</span>
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <User size={16} /> Área Restrita
        </Link>
      </nav>

      <main>{children}</main>

      <footer className="bg-white py-20 px-10 text-center border-t border-gray-100">
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">
          Powered by Flaience Holding
        </p>
      </footer>
    </div>
  );
}
