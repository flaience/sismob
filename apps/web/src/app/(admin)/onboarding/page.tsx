"use client";
import SismobFormMaster from "@/components/SismobFormMaster";

export default function OnboardingFlaience() {
  return (
    <SismobFormMaster
      title="Nova Imobiliária Cliente"
      endpoint="/saas/onboarding" // Rota que vamos criar no backend
      sections={[
        {
          title: "Dados da Empresa",
          fields: [
            {
              name: "nomeEmpresa",
              label: "Nome da Imobiliária",
              type: "text",
              fullWidth: true,
            },
            {
              name: "slug",
              label: "Link de Acesso (ex: imobiliaria-silva)",
              type: "text",
            },
            {
              name: "email_financeiro",
              label: "E-mail de Cobrança",
              type: "text",
            },
          ],
        },
        {
          title: "Acesso do Dono (Admin)",
          fields: [
            { name: "nomeDono", label: "Nome do Proprietário", type: "text" },
            { name: "email", label: "E-mail de Login", type: "text" },
            { name: "documento", label: "CPF do Dono", type: "text" },
          ],
        },
      ]}
      aiHelp="Luis, este formulário cria o Tenant, a Matriz e o Usuário Admin da Imobiliária de uma só vez."
    />
  );
}
