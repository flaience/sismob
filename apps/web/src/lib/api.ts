//src/lib/api.ts
import axios from "axios";
import { supabase } from "./supabase"; // Importando o objeto pronto

const api = axios.create({
  baseURL: "https://sismob-production-ca9b.up.railway.app", // Sua URL do Railway
});

// INTERCEPTOR BLINDADO
api.interceptors.request.use(async (config) => {
  try {
    // 1. Pegamos a sessão do objeto que já existe
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log("🔑 [SISMOB] Token anexado com sucesso!");
    }
  } catch (error) {
    console.error("❌ [SISMOB] Falha no interceptor:", error);
  }
  return config;
});

export default api;
