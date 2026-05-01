import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: "https://sismob-production-ca9b.up.railway.app",
  timeout: 45000, // <--- SE A API NÃO RESPONDER EM 8S, ELA CANCELA E O DASHBOARD ABRE
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
