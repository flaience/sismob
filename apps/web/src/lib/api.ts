import axios from "axios";
import { createClient } from "./supabase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

// Este código roda antes de QUALQUER requisição para a API
api.interceptors.request.use(async (config) => {
  const supabase = createClient();

  // Pega a sessão atual do Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se o usuário estiver logado, anexa o Token no cabeçalho
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export default api;
