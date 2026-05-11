import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  // URL LIMPA QUE VOCÊ CRIOU HOJE
  baseURL: "https://sismob-production.up.railway.app",
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export default api;
