"use client";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SismobFormMaster from "@/components/SismobFormMaster";
import { PAPEIS_LABELS } from "@/lib/constants";

function ManutencaoContent() {
  const { papel } = useParams();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <SismobFormMaster
      title={PAPEIS_LABELS[papel as string] || "Registro"}
      endpoint="/pessoas"
      sections={[
        {
          title: "Identificação",
          fields: [
            {
              name: "nome",
              label: "Nome Completo",
              type: "text",
              fullWidth: true,
            },
            { name: "email", label: "E-mail", type: "text" },
            { name: "documento", label: "CPF/CNPJ", type: "text" },
          ],
        },
      ]}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-10 font-black">Preparando ambiente...</div>}
    >
      <ManutencaoContent />
    </Suspense>
  );
}
