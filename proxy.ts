import { NextResponse, type NextRequest } from "next/server";

// Contrôle optimiste : sans cookie de session Auth.js, vraie redirection 307 vers /login.
// La vérification réelle du rôle reste requireRole() dans chaque page et action.
export function proxy(req: NextRequest) {
  const connecte =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");
  if (!connecte) return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: "/admin/:path*" };
