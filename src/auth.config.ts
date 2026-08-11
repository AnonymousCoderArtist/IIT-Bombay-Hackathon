import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "faculty" | "coordinator" | "admin";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
