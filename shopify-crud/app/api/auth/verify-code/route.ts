import { NextRequest, NextResponse } from "next/server"
import { getPending, deletePending, recordAttempt } from "@/lib/pendingCodes"
import { saveRegisteredUser } from "@/lib/registeredUsers"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code)
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 })

  const pending = getPending(email.toLowerCase())

  if (!pending)
    return NextResponse.json({ error: "Código expirado o inválido. Solicita uno nuevo." }, { status: 400 })

  if (pending.code !== String(code).trim()) {
    const stillAlive = recordAttempt(email)
    const msg = stillAlive
      ? `Código incorrecto. Te quedan ${5 - pending.attempts - 1} intentos.`
      : "Demasiados intentos fallidos. Solicita un nuevo código."
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  saveRegisteredUser({
    id: crypto.randomUUID(),
    name: pending.name,
    email: pending.email,
    passwordHash: pending.passwordHash,
    role: "user",
    createdAt: new Date().toISOString(),
  })

  deletePending(pending.email)

  return NextResponse.json({ ok: true })
}
