import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // 🛡️ REGRA DE OURO: Se for a página de reset, NÃO FAZ NADA.
  // Não checa usuário, não chama Supabase. Apenas deixa passar.
  if (pathname.startsWith("/reset-password")) {
    return res;
  }

  // Se for admin, você pode manter a trava original se quiser,
  // mas por enquanto, vamos focar em destravar o Reset.
  return res;
}

// apps/web/src/middleware.ts
export const config = {
  matcher: [
    /*
     * 🛡️ LIBERAÇÃO TOTAL PARA AS ROTAS DE RESET
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|auth/confirm|reset-password).*)",
  ],
};
