import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { findUserByEmail, verifyPassword } from "@/lib/registeredUsers"
import crypto from "crypto"

declare module "next-auth" {
  interface Session { user: { role: string } & DefaultSession["user"] }
  interface User { role: string }
  interface JWT { role: string }
}

const HARDCODED = [
  { id: "1", name: "Admin",   email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD!, role: "admin" },
  { id: "2", name: "Usuario", email: process.env.USER_EMAIL!,  password: process.env.USER_PASSWORD!,  role: "user"  },
]

function safeCompare(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const hardcoded = HARDCODED.find(
          u => u.email === credentials.email &&
               safeCompare(String(credentials.password), u.password)
        )
        if (hardcoded) return { id: hardcoded.id, name: hardcoded.name, email: hardcoded.email, role: hardcoded.role }

        const registered = findUserByEmail(String(credentials.email))
        if (registered && verifyPassword(String(credentials.password), registered.passwordHash)) {
          return { id: registered.id, name: registered.name, email: registered.email, role: registered.role }
        }

        return null
      },
    }),
  ],
})
