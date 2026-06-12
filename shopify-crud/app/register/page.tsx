"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

function GradientBlob() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="blob-animate"
        style={{
          width: "72%", height: "72%",
          background: "linear-gradient(135deg, #e8d8a0 0%, #c8a85a 18%, #7ba5e8 55%, #1a2f8f 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), inset 0 0 60px rgba(255,255,255,0.08)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "80%", height: "80%",
          background: "radial-gradient(ellipse at 40% 50%, rgba(200,168,90,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.25) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
      />
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "verify">("form")
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
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

    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })
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
    <div className="min-h-screen flex" style={{ background: "#071030" }}>
      {/* LEFT */}
      <div className="w-full lg:w-5/12 flex flex-col items-center justify-center p-10" style={{ background: "#ffffff", minHeight: "100vh" }}>
        {/* Logo */}
        <div className="w-full max-w-sm mb-10">
          <Link href="/login" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 12px rgba(59,130,246,0.35)" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ color: "#0f172a" }}>REECH STORE</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {step === "form" ? (
            <>
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#dbeafe,#eff6ff)", border: "3px solid #bfdbfe", boxShadow: "0 4px 20px rgba(59,130,246,0.15)" }}>
                  <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#0f172a" }}>Crear cuenta</h2>
              <p className="text-center text-sm mb-8" style={{ color: "#64748b" }}>Regístrate para empezar a comprar</p>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Nombre completo" className="input-store"
                    onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e8edf2")} />
                </div>

                {/* Email */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Correo electrónico" className="input-store"
                    onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e8edf2")} />
                </div>

                {/* Password */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Contraseña (mín. 8 caracteres)" className="input-store"
                    onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e8edf2")} />
                </div>

                {/* Confirm */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </span>
                  <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required placeholder="Confirmar contraseña" className="input-store"
                    onFocus={e => (e.target.style.borderColor = "#3b82f6")} onBlur={e => (e.target.style.borderColor = "#e8edf2")} />
                </div>

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca" }}>{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 20px rgba(59,130,246,0.35)", letterSpacing: "0.06em", marginTop: "0.25rem" }}>
                  {loading ? "ENVIANDO CÓDIGO..." : "CREAR CUENTA"}
                </button>
              </form>

              <p className="text-center text-xs mt-6" style={{ color: "#94a3b8" }}>
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold hover:underline" style={{ color: "#3b82f6" }}>Inicia sesión</Link>
              </p>
            </>
          ) : (
            <>
              {/* Verify step */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", border: "3px solid #a7f3d0", boxShadow: "0 4px 20px rgba(16,185,129,0.15)" }}>
                  <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#0f172a" }}>Revisa tu correo</h2>
              <p className="text-center text-sm mb-2" style={{ color: "#64748b" }}>
                Enviamos un código de 6 dígitos a
              </p>
              <p className="text-center text-sm font-semibold mb-8" style={{ color: "#1d4ed8" }}>{form.email}</p>

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="Código de 6 dígitos"
                  className="w-full text-center text-3xl font-bold tracking-[0.4em] outline-none rounded-xl py-4"
                  style={{ background: "#f4f6f9", border: "1.5px solid #e8edf2", color: "#0f172a" }}
                  onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={e => (e.target.style.borderColor = "#e8edf2")}
                />

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca" }}>{error}</p>
                )}

                <button type="submit" disabled={loading || code.length < 6}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", boxShadow: "0 4px 20px rgba(59,130,246,0.35)", letterSpacing: "0.06em" }}>
                  {loading ? "VERIFICANDO..." : "VERIFICAR Y ENTRAR"}
                </button>
              </form>

              <div className="flex items-center justify-between mt-5">
                <button onClick={() => { setStep("form"); setError("") }}
                  className="text-xs hover:underline" style={{ color: "#94a3b8" }}>
                  ← Cambiar correo
                </button>
                <button onClick={handleResend} disabled={loading}
                  className="text-xs font-semibold hover:underline disabled:opacity-50" style={{ color: "#3b82f6" }}>
                  Reenviar código
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden" style={{ background: "#071030" }}>
        <GradientBlob />
        <div className="relative z-10 flex flex-col justify-end p-14 pb-16 w-full">
          <h1 className="text-7xl font-bold text-white leading-none tracking-tight" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}>
            Welcome.
          </h1>
          <p className="mt-4 text-sm max-w-xs leading-relaxed" style={{ color: "rgba(191,219,254,0.7)" }}>
            Crea tu cuenta y accede a nuestra colección exclusiva de productos.
          </p>
        </div>
      </div>
    </div>
  )
}
