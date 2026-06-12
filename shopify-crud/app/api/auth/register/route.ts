import { NextRequest, NextResponse } from "next/server"
import { findUserByEmail, hashPassword } from "@/lib/registeredUsers"
import { savePending, generateCode } from "@/lib/pendingCodes"
import { sendVerificationCode } from "@/lib/mailer"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ""
const USER_EMAIL = process.env.USER_EMAIL ?? ""

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: "Todos los campos son obligatorios." }, { status: 400 })

  if (password.length < 8)
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 })

  const lower = email.toLowerCase()

  if (lower === ADMIN_EMAIL.toLowerCase() || lower === USER_EMAIL.toLowerCase())
    return NextResponse.json({ error: "Este correo ya está registrado." }, { status: 409 })

  if (findUserByEmail(lower))
    return NextResponse.json({ error: "Este correo ya está registrado." }, { status: 409 })

  const code = generateCode()
  const passwordHash = hashPassword(password)

  savePending({
    email: lower,
    name,
    passwordHash,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  })

  try {
    await sendVerificationCode(lower, name, code)
  } catch (err) {
    console.error("Error sending email:", err)
    return NextResponse.json({ error: "No se pudo enviar el correo. Revisa la configuración de Gmail." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
