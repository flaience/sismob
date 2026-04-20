import Link from "next/link";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="p-6 flex justify-between items-center border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="font-black text-2xl text-indigo-600">
          SIS<span className="text-gray-900">MOB</span>
        </div>
        <Link
          href="/login"
          className="bg-gray-900 text-white p-3 px-6 rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all"
        >
          Área do Corretor
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
