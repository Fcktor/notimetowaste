import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    },
  },
  providers: [],
}
