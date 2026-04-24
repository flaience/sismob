import CrudMaster from "@/components/CrudMaster";

export default function BancosPage() {
  return (
    <CrudMaster
      title="Cadastro de Bancos"
      endpoint="/bancos"
      columns={[
        { label: "Código FEBRABAN", key: "codigo_compe" },
        { label: "Nome do Banco", key: "nome" },
      ]}
      fields={[
        { name: "codigo_compe", label: "Código do Banco", type: "text" },
        { name: "nome", label: "Nome da Instituição", type: "text" },
      ]}
    />
  );
}
