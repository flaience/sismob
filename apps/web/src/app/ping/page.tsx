"use client";
export default function PingPage() {
  return (
    <div style={{ padding: "100px", textAlign: "center", background: "white" }}>
      <h1 style={{ color: "black", fontSize: "50px" }}>O NEXT.JS ESTÁ VIVO!</h1>
      <p style={{ color: "gray" }}>
        Se você ler isso, a Vercel está enviando os arquivos corretamente.
      </p>
      <button onClick={() => (window.location.href = "/dashboard")}>
        Ir para o Dashboard
      </button>
    </div>
  );
}
