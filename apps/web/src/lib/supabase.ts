import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: "implicit", // 🚀 O SEGREDO: O token vem no '#' e o Middleware não vê!
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
