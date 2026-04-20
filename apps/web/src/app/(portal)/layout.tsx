// apps/web/src/app/(portal)/layout.tsx
import Link from "next/link";
import { Lock } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER SUTIL PARA VISITANTES */}
      <header className="px-8 py-6 flex justify-between items-center border-b border-gray-50">
        <div className="font-black text-xl text-indigo-600 tracking-tighter uppercase">
          SIS<span className="text-gray-900">MOB</span>
        </div>

        {/* BOTÃO DISCRETO PARA LOGIN (Sua sugestão estratégica) */}
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-all text-[10px] font-bold uppercase tracking-widest"
        >
          <Lock size={14} />
          Acesso Restrito
        </Link>
      </header>

      <main className="w-full">{children}</main>
    </div>
  );
}
