"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function DashboardPage() {
  const auth = useAuth();
  const { tenant } = useTenant();

  // Se o auth for null por algum erro de contexto, ele não quebra mais o site
  const user = auth?.user;

  return (
    <div style={{ padding: "40px", background: "white", borderRadius: "40px" }}>
      <h1 style={{ color: "black", fontSize: "30px", fontWeight: "900" }}>
        PAINEL: {tenant?.nome_conta || "CARREGANDO..."}
      </h1>
      <p style={{ color: "gray" }}>
        Usuário logado: {user?.email || "Verificando..."}
      </p>
      <hr style={{ margin: "20px 0" }} />
      <div style={{ color: "indigo", fontWeight: "bold" }}>
        STATUS DO SISTEMA: ONLINE
      </div>
    </div>
  );
}
