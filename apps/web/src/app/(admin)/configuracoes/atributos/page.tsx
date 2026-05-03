import CrudMaster from "@/components/CrudMaster";

export const dynamic = "force-dynamic";
export default function AtributosPage() {
  return (
    <CrudMaster
      title="Categorias de Atributos"
      endpoint="/categorias-atributos"
      columns={[{ label: "Nome da Categoria", key: "nome" }]}
      fields={[
        { name: "nome", label: "Nome (Ex: Lazer, Estrutura)", type: "text" },
      ]}
    />
  );
}
