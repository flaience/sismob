"use client";
export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      <div
        style={{
          background: "white",
          padding: "20px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <strong>SISMOB BARRA DE TESTE</strong>
      </div>
      <main>{children}</main>
    </div>
  );
}
