import { Link } from "expo-router";
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header simples no topo */}
      <header className="p-6 flex justify-between items-center border-b border-gray-50">
        <div className="font-black text-2xl text-indigo-600">
          SIS<span className="text-gray-900">MOB</span>
        </div>
        <Link
          href="/login"
          className="bg-gray-100 p-3 rounded-2xl text-gray-600 font-bold text-xs"
        >
          Acesso Restrito
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
