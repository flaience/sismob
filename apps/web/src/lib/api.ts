//src/lib/api.ts
import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  // USE O DOMÍNIO NOVO QUE VOCÊ CRIOU!
  baseURL: "https://sismob-production.up.railway.app",
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (e) {
    console.error("Erro no token");
  }
  return config;
});

export default api;
