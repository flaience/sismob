import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/reset-password";

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          // 🛡️ TIPAGEM INDUSTRIAL: Resolve o erro TS(7006) e TS(7031)
          setAll(
            cookiesToSet: { name: string; value: string; options: any }[],
          ) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Contexto de Server Component, ignoramos o erro de escrita
            }
          },
        },
      },
    );

    // 🚀 O TIRO DE MISERICÓRDIA: Valida o link no Servidor
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Se o link é válido, o servidor gera o cookie e te joga pra trocar a senha
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Se falhar, volta pro login com aviso
  return NextResponse.redirect(`${origin}/login?error=invalid_recovery_link`);
}
