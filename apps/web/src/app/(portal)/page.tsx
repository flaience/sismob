import Link from "next/link"; // <--- CORREÇÃO: Usar next/link, NUNCA expo-router

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simples e elegante para o visitante */}
      <header className="p-6 flex justify-between items-center border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="font-black text-2xl text-indigo-600 tracking-tighter">
          SIS<span className="text-gray-900">MOB</span>
        </div>
        <Link
          href="/login"
          className="bg-gray-100 hover:bg-indigo-600 hover:text-white p-3 px-6 rounded-2xl text-gray-600 font-bold text-xs transition-all"
        >
          Acesso Restrito
        </Link>
      </header>

      <main className="w-full">{children}</main>
    </div>
  );
}
