import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* A Sidebar só existe aqui dentro da pasta (admin) */}
      <Sidebar />

      {/* O padding pl-32 só existe aqui, para não empurrar o site do cliente */}
      <main className="flex-1 pl-0 md:pl-32 p-4 md:p-10 transition-all duration-500">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
