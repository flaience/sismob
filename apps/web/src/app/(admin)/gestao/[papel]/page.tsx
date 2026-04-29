"use client";
import { useParams, useRouter } from "next/navigation";
import SismobListMaster from "@/components/SismobListMaster";
import { PAPEIS, PAPEIS_LABELS } from "@/lib/constants";

export default function CRMGrid() {
  const { papel } = useParams();
  const router = useRouter();

  // Mapeamento de URL para ID do Banco
  const tradutor: any = {
    leads: PAPEIS.INTERESSADO,
    compradores: PAPEIS.CLIENTE_COMPRADOR,
    proprietarios: PAPEIS.PROPRIETARIO,
    inquilinos: PAPEIS.INQUILINO,
    equipe: PAPEIS.EQUIPE,
  };

  const papelId = tradutor[papel as string];

  return (
    <SismobListMaster
      title={PAPEIS_LABELS[papelId] || "Gestão"}
      endpoint="/pessoas"
      filters={{ papel: papelId }} // Filtro automático para o GenericService
      columns={[
        { label: "Nome", key: "nome" },
        { label: "E-mail", key: "email" },
        { label: "Documento", key: "documento" },
      ]}
      onAdd={() => router.push(`/gestao/${papel}/manutencao?papel=${papelId}`)}
      onEdit={(item: any) =>
        router.push(
          `/gestao/${papel}/manutencao?id=${item.id}&papel=${papelId}`,
        )
      }
    />
  );
}
