import CrudMaster from "@/components/CrudMaster";
export default function GruposCaixaPage() {
  return (
    <CrudMaster
      title="Grupos de Caixa"
      endpoint="/grupos-caixa"
      columns={[
        { label: "Cód", key: "codigo" },
        { label: "Descrição", key: "descricao" },
        { label: "Tipo", key: "tipo" },
      ]}
      fields={[
        { name: "codigo", label: "Código Contábil", type: "text" },
        { name: "descricao", label: "Nome do Grupo", type: "text" },
        {
          name: "tipo",
          label: "Natureza (c/d)",
          type: "select",
          options: [
            { label: "Crédito", value: "c" },
            { label: "Débito", value: "d" },
          ],
        },
      ]}
    />
  );
}
