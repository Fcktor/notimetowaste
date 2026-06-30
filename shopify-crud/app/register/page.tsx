"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { WatchClock } from "@/components/WatchClock"

function WatchLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="#C4A35A" strokeWidth="1" />
        <circle cx="16" cy="16" r="1.5" fill="#C4A35A" />
        <line x1="16" y1="4.5" x2="16" y2="7" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="16" x2="16" y2="9.5" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
        <line x1="16" y1="16" x2="21.5" y2="16" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span
        className="font-display italic tracking-wide"
        style={{ color: "#C4A35A", fontSize: "1.05rem", fontWeight: 600 }}
      >
        No Time To Waste
      </span>
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(196,163,90,0.15)",
  borderRadius: "0.375rem",
  padding: "0.75rem 0.875rem 0.75rem 2.6rem",
  fontSize: "0.875rem",
  color: "#EDE8DF",
  width: "100%",
  outline: "none",
  fontFamily: "var(--font-dm-sans)",
}

const FIELDS = [
  {
    name: "name" as const, type: "text", placeholder: "Nombre completo",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    name: "email" as const, type: "email", placeholder: "Correo electrónico",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    name: "password" as const, type: "password", placeholder: "Contraseña (mín. 8 caracteres)",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    name: "confirm" as const, type: "password", placeholder: "Confirmar contraseña",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
]

interface FormState { name: string; email: string; password: string; confirm: string }

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "verify">("form")
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "", confirm: "" })
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden."); return }
    if (form.password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return }
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setStep("verify")
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code }),
    })
    const data = await res.json()
    if (!res.ok) { setLoading(false); setError(data.error); return }
    const login = await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    setLoading(false)
    if (login?.error) { setError("Cuenta creada, pero no se pudo iniciar sesión automáticamente."); return }
    router.push("/")
    router.refresh()
  }

  async function handleResend() {
    setError("")
    setLoading(true)
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0B09" }}>
      {/* ──── LEFT: Form ──── */}
      <div
        className="w-full lg:w-5/12 flex flex-col items-center justify-center p-10"
        style={{ background: "#0F0E0C", borderRight: "1px solid rgba(196,163,90,0.08)", minHeight: "100vh" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-12">
            <Link href="/login"><WatchLogo /></Link>
          </div>

          {step === "form" ? (
            <>
              <h2 className="font-display italic mb-2" style={{ fontSize: "2rem", color: "#EDE8DF", fontWeight: 400 }}>
                Crear cuenta
              </h2>
              <p className="text-sm mb-8" style={{ color: "#7A6E64" }}>
                Regístrate para empezar a comprar
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                {FIELDS.map(f => (
                  <div key={f.name} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(122,110,100,0.5)" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                      </svg>
                    </span>
                    <input
                      name={f.name} type={f.type} value={form[f.name]}
                      onChange={handleChange} required placeholder={f.placeholder}
                      style={INPUT_STYLE}
                      onFocus={e => (e.target.style.borderColor = "rgba(196,163,90,0.5)")}
                      onBlur={e => (e.target.style.borderColor = "rgba(196,163,90,0.15)")}
                    />
                  </div>
                ))}

                {error && (
                  <p className="text-xs px-3 py-2.5" style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.25rem" }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 text-xs uppercase tracking-[0.14em] transition-all duration-200 disabled:opacity-50 mt-2"
                  style={{ background: "#C4A35A", color: "#0C0B09", borderRadius: "0.25rem", fontFamily: "var(--font-dm-sans)" }}>
                  {loading ? "Enviando código..." : "Crear cuenta"}
                </button>
              </form>

              <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(196,163,90,0.08)" }}>
                <p className="text-xs" style={{ color: "#7A6E64" }}>
                  ¿Ya tienes cuenta?{" "}
                  <Link href="/login" style={{ color: "#C4A35A" }}>Inicia sesión</Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display italic mb-2" style={{ fontSize: "2rem", color: "#EDE8DF", fontWeight: 400 }}>
                Revisa tu correo
              </h2>
              <p className="text-sm mb-1" style={{ color: "#7A6E64" }}>
                Enviamos un código de 6 dígitos a
              </p>
              <p className="text-sm font-semibold mb-8" style={{ color: "#C4A35A" }}>{form.email}</p>

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  required placeholder="••••••"
                  className="w-full text-center text-4xl font-bold tracking-[0.5em] outline-none py-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(196,163,90,0.15)",
                    borderRadius: "0.375rem",
                    color: "#C4A35A",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(196,163,90,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(196,163,90,0.15)")}
                />

                {error && (
                  <p className="text-xs px-3 py-2.5" style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.25rem" }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading || code.length < 6}
                  className="w-full py-3 text-xs uppercase tracking-[0.14em] transition-all duration-200 disabled:opacity-50"
                  style={{ background: "#C4A35A", color: "#0C0B09", borderRadius: "0.25rem", fontFamily: "var(--font-dm-sans)" }}>
                  {loading ? "Verificando..." : "Verificar y entrar"}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6">
                <button onClick={() => { setStep("form"); setError("") }}
                  className="text-xs transition-colors" style={{ color: "#7A6E64" }}>
                  ← Cambiar correo
                </button>
                <button onClick={handleResend} disabled={loading}
                  className="text-xs transition-colors disabled:opacity-50" style={{ color: "#C4A35A" }}>
                  Reenviar código
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ──── RIGHT: Brand panel ──── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col items-center justify-center gap-10" style={{ background: "#0C0B09" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(196,163,90,0.07) 0%, transparent 65%)",
        }} />

        <div className="relative z-10">
          <WatchClock size={300} />
        </div>

        <div className="relative z-10 text-center">
          <h1 className="font-display italic leading-none" style={{ fontSize: "2rem", color: "rgba(237,232,223,0.55)", fontWeight: 400, letterSpacing: "0.04em" }}>
            No Time To Waste
          </h1>
          <p className="text-[10px] mt-3 uppercase tracking-[0.25em]" style={{ color: "rgba(196,163,90,0.4)" }}>
            Relojes que definen cada momento
          </p>
        </div>
      </div>
    </div>
  )
}
