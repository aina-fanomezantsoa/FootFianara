import { redirect } from "next/navigation";
import { hasRole, MAX_STAFF } from "./roles";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "../generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: { id: string; role: Role; name: string; email: string };
  }
}
declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      async authorize(c) {
        const email = String(c?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(c?.password ?? "");
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.passwordHash)))
          return null;
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role;
      return session;
    },
  },
});

// À appeler au début de chaque page admin et de chaque action serveur.
export async function requireRole(min: Role) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!hasRole(session.user.role, min)) redirect("/admin?refuse=1");
  return session.user;
}

export async function assertStaffLimit() {
  if ((await db.user.count()) >= MAX_STAFF)
    throw new Error(`Limite de ${MAX_STAFF} comptes atteinte`);
}
