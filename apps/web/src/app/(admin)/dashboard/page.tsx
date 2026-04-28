"use client";
export default function DebugDashboard() {
  return (
    <div style={{ background: "white", padding: "50px", minHeight: "100vh" }}>
      <h1 style={{ color: "indigo", fontWeight: "900" }}>SISMOB DEBUG</h1>
      <p style={{ color: "black" }}>Dashboard carregado sem lógica de banco.</p>
      <p style={{ color: "black" }}>Hora: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
