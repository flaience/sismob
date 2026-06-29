import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          // 🛡️ DEFINIMOS OS TIPOS AQUI PARA MATAR O ERRO TS(7006) e TS(7031)
          setAll(
            cookiesToSet: { name: string; value: string; options: any }[],
          ) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // Em Server Components isso pode falhar, mas o middleware gerencia
            }
          },
        },
      },
    );

    // 🚀 TROCA O CÓDIGO PELA SESSÃO
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log(
        "✅ [SISMOB CALLBACK] Sessão criada, redirecionando para:",
        next,
      );
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error(
        "❌ [SISMOB CALLBACK] Erro na troca de código:",
        error.message,
      );
    }
  }

  // Se o código for inválido ou expirar, volta pro login com aviso
  return NextResponse.redirect(`${origin}/login?error=invalid_token`);
}
