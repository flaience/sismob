import SismobFormMaster from "@/components/SismobFormMaster";

export default function ManutencaoPessoa() {
  return (
    <SismobFormMaster
      title="Cadastro de Pessoa"
      endpoint="/pessoas"
      sections={[
        {
          title: "Identificação",
          fields: [
            {
              name: "nome",
              label: "Nome / Razão Social",
              type: "text",
              fullWidth: true,
            },
            {
              name: "tipo",
              label: "Tipo",
              type: "select",
              options: [
                { label: "Física", value: "f" },
                { label: "Jurídica", value: "j" },
              ],
            },
            { name: "documento", label: "CPF / CNPJ", type: "text" },
            { name: "unidade_id", label: "Unidade", type: "select" },
          ],
        },
        {
          title: "Localização",
          fields: [
            { name: "cep", label: "CEP", type: "text" },
            {
              name: "logradouro",
              label: "Endereço",
              type: "text",
              fullWidth: true,
            },
            { name: "numero", label: "Número", type: "text" },
            { name: "cidade", label: "Cidade", type: "text" },
          ],
        },
      ]}
      aiHelp="Ensine o Agente MCP sobre como cadastrar pessoas neste campo..."
    />
  );
}
