import axios from "axios";

// Usamos a URL que já está voando no Railway
const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    "https://api-sismob-production.up.railway.app",
});

// Interceptor para injetar o Token no futuro
api.interceptors.request.use(async (config) => {
  // Aqui buscaremos o token do SecureStore do Expo
  return config;
});

export default api;
