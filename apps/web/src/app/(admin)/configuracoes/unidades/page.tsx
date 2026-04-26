"use client";
import CrudMaster from "@/components/CrudMaster";

export default function UnidadesPage() {
  return (
    <CrudMaster
      title="Unidades / Filiais"
      endpoint="/configuracoes/unidades"
      columns={[
        { label: "Nome da Unidade", key: "nome" },
        { label: "Cidade", key: "cidade" },
        { label: "CNPJ", key: "cnpj" },
      ]}
      fields={[
        { name: "nome", label: "Nome da Filial", type: "text" },
        { name: "cnpj", label: "CNPJ da Unidade", type: "text" },
        { name: "cidade", label: "Cidade", type: "text" },
      ]}
    />
  );
}
