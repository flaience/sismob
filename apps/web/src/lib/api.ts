import axios from "axios";
import { createClient } from "./supabase";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://sismobapi-production.up.railway.app",
});

api.interceptors.request.use(async (config) => {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      console.log("🔑 Token anexado à requisição com sucesso!");
      config.headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      console.warn("⚠️ Nenhuma sessão ativa encontrada. Enviando sem token...");
    }
  } catch (error) {
    console.error("❌ Falha no interceptor de autenticação:", error);
  }
  return config;
});

export default api;
