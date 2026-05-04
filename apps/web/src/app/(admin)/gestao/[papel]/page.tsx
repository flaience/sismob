//src/app/(admin)/gestao/[papel]/page.tsx
"use client";
import { useParams } from "next/navigation";

export default function TesteRota() {
  const params = useParams();
  return (
    <div
      style={{
        padding: "100px",
        background: "white",
        color: "black",
        zIndex: 9999,
      }}
    >
      <h1>ROTA ACESSADA COM SUCESSO!</h1>
      <p>
        O parâmetro capturado foi: <strong>{params?.papel}</strong>
      </p>
      <p>
        Se você está lendo isso, o erro NÃO É na rota, mas nos componentes
        internos.
      </p>
    </div>
  );
}
