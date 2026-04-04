// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server"; // MUDOU AQUI (era next/request)

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();

//   // Cria o cliente do Supabase específico para o Middleware
//   const supabase = createMiddlewareClient({ req, res });

//   // Verifica se existe uma sessão ativa
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // Se o usuário tentar acessar qualquer rota que comece com /admin e não estiver logado
//   if (req.nextUrl.pathname.startsWith("/admin") && !session) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return res;
// }

// // Define quais caminhos o middleware deve observar
// export const config = {
//   matcher: ["/admin/:path*", "/perfil/:path*"],
// };
