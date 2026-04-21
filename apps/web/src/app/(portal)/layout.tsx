import Link from "next/link";
import { Lock } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="px-8 py-6 flex justify-between items-center border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="font-black text-xl text-indigo-600 uppercase">
          SIS<span className="text-gray-900">MOB</span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          <Lock size={14} /> Acesso Restrito
        </Link>
      </header>
      <main className="w-full">{children}</main>
    </div>
  );
}
