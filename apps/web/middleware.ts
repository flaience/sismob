import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🛡️ SE FOR RESET-PASSWORD, O MIDDLEWARE ESTÁ PROIBIDO DE AGIR
  if (pathname === "/reset-password") {
    return NextResponse.next();
  }

  // Resto da sua proteção (se quiser deixar tudo liberado por enquanto para testar):
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
