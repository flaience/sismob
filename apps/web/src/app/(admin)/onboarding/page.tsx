"use client";
import { Suspense } from "react";
import SismobFormMaster from "@/components/SismobFormMaster";

function OnboardingContent() {
  return (
    <SismobFormMaster
      title="Nova Imobiliária Cliente"
      endpoint="/saas/onboarding" // Bate com o @Controller('saas') e @Post('onboarding')
      sections={[
        {
          title: "Dados da Empresa (Faturamento)",
          fields: [
            {
              name: "nomeEmpresa",
              label: "Nome da Imobiliária",
              type: "text",
              required: true,
              fullWidth: true,
            },
            {
              name: "slug",
              label: "Link de Acesso (Ex: silva-imoveis)",
              type: "text",
              required: true,
            },
            {
              name: "email_financeiro",
              label: "E-mail para Cobrança",
              type: "text",
              required: true,
            },
          ],
        },
        {
          title: "Dados do Proprietário (Admin)",
          fields: [
            {
              name: "nomeDono",
              label: "Nome do Responsável",
              type: "text",
              required: true,
            },
            {
              name: "email",
              label: "E-mail de Login",
              type: "text",
              required: true,
            },
            {
              name: "documento",
              label: "CPF do Dono",
              type: "text",
              required: true,
            },
          ],
        },
      ]}
      aiHelp="Este formulário cria o Tenant, a Matriz e o Usuário Mestre."
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 font-black animate-pulse">
          Iniciando Esteira Industrial...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
