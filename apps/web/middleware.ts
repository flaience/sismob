import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🛡️ SE FOR RESET OU LOGIN, DEIXA PASSAR DIRETO SEM OLHAR NADA
  if (
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth")
  ) {
    return NextResponse.next();
  }

  // Só protege o que for administrativo
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/gestao")
  ) {
    // Aqui você pode colocar sua lógica de proteção depois,
    // por enquanto, vamos apenas liberar o sistema para você trabalhar.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
