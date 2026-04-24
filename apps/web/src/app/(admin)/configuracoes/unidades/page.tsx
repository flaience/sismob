import CrudMaster from "@/components/CrudMaster";
export default function UnidadesPage() {
  return (
    <CrudMaster
      title="Unidades de Negócio"
      endpoint="/unidades"
      columns={[
        { label: "Nome da Filial", key: "nome" },
        { label: "CNPJ", key: "cnpj" },
      ]}
      fields={[
        { name: "nome", label: "Nome da Unidade", type: "text" },
        { name: "cnpj", label: "CNPJ da Filial", type: "text" },
      ]}
    />
  );
}
