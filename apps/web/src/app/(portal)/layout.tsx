import Link from "next/link"; // <--- CORREÇÃO OBRIGATÓRIA

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="p-6 flex justify-between items-center border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="font-black text-2xl text-indigo-600 tracking-tighter">
          SIS<span className="text-gray-900">MOB</span>
        </div>
        <Link
          href="/login"
          className="bg-gray-100 p-3 px-6 rounded-2xl text-gray-600 font-bold text-xs"
        >
          Acesso Restrito
        </Link>
      </header>
      <main className="w-full">{children}</main>
    </div>
  );
}
