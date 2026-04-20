//src/app/(admin)/layout.tsx
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* Espaçamento lateral apenas para o Admin ver o menu */}
      <main className="flex-1 pl-0 md:pl-32 p-4 md:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
