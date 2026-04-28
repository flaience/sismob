"use client";
import { useTenant } from "@/context/TenantContext";

export default function DashboardPage() {
  const { tenant } = useTenant();

  return (
    <div style={{ background: "white", padding: "50px", minHeight: "100vh" }}>
      <h1 style={{ color: "indigo", fontWeight: "900", fontSize: "40px" }}>
        SISMOB CONECTADO
      </h1>
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "2px solid indigo",
          borderRadius: "20px",
        }}
      >
        <p style={{ color: "black", fontSize: "20px" }}>
          Imobiliária:{" "}
          <strong>{tenant?.nome_conta || "Não encontrada no banco"}</strong>
        </p>
        <p style={{ color: "gray" }}>ID: {tenant?.id || "Nulo"}</p>
      </div>
      <p style={{ color: "black", marginTop: "20px" }}>
        Próximo passo: Ativar o login do Supabase.
      </p>
    </div>
  );
}
