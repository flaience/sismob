import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const url = "https://ldmyywjrqyqoafwxspin.supabase.co";
  const key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbXl5d2pycXlxb2Fmd3hzcGluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE1MDkxOCwiZXhwIjoyMDg4NzI2OTE4fQ.Hr5Vvw2NxpxCDb9uJB2i2807d_rfT1kAAG72GLVix40";

  // Isso vai imprimir no console do seu NAVEGADOR (aperte F12)
  if (!url || !key) {
    console.error("🚨 ALERTA: Variáveis de ambiente sumiram!");
    console.log("URL encontrada:", url);
    console.log("Chave encontrada:", key);
  }

  return createBrowserClient(url!, key!);
};
