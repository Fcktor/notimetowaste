"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function GradientBlob() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Main blob */}
      <div
        className="blob-animate"
        style={{
          width: "72%",
          height: "72%",
          background:
            "linear-gradient(135deg, #e8d8a0 0%, #c8a85a 18%, #7ba5e8 55%, #1a2f8f 100%)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.35), inset 0 0 60px rgba(255,255,255,0.08)",
        }}
      />
      {/* Soft glow behind blob */}
      <div
        className="absolute"
        style={{
          width: "80%",
          height: "80%",
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(200,168,90,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.25) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
      />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError("Email o contraseña incorrectos.");
    else { router.push(callbackUrl); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#071030" }}>
      {/* ──── LEFT: Form ──── */}
      <div
        className="w-full lg:w-5/12 flex flex-col items-center justify-center p-10"
        style={{ background: "#ffffff", minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="w-full max-w-sm mb-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-wide" style={{ color: "#0f172a" }}>
              REECH STORE
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #dbeafe, #eff6ff)",
                border: "3px solid #bfdbfe",
                boxShadow: "0 4px 20px rgba(59,130,246,0.15)",
              }}
            >
              <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-1" style={{ color: "#0f172a" }}>
            Bienvenido
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: "#64748b" }}>
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                placeholder="Email"
                className="input-store"
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                placeholder="Contraseña"
                className="input-store"
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca" }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                letterSpacing: "0.08em",
                marginTop: "0.25rem",
              }}
            >
              {loading ? "VERIFICANDO..." : "INICIAR SESIÓN"}
            </button>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: "#64748b" }}>
                <input type="checkbox" className="rounded" style={{ accentColor: "#3b82f6" }} />
                Recordarme
              </label>
              <a href="/" className="text-xs transition-colors hover:underline" style={{ color: "#3b82f6" }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "#94a3b8" }}>
            ¿No tienes cuenta?{" "}
            <a href="/register" className="font-semibold hover:underline" style={{ color: "#3b82f6" }}>
              Regístrate
            </a>
          </p>
          <p className="text-center text-xs mt-3" style={{ color: "#94a3b8" }}>
            ¿Solo quieres ver la tienda?{" "}
            <a href="/" className="font-semibold hover:underline" style={{ color: "#3b82f6" }}>
              Ir al catálogo
            </a>
          </p>
        </div>
      </div>

      {/* ──── RIGHT: Hero ──── */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden"
        style={{ background: "#071030" }}
      >
        <GradientBlob />

        {/* Bottom text */}
        <div className="relative z-10 flex flex-col justify-end p-14 pb-16 w-full">
          <h1
            className="text-7xl font-bold text-white leading-none tracking-tight"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}
          >
            Welcome.
          </h1>
          <p className="mt-4 text-sm max-w-xs leading-relaxed" style={{ color: "rgba(191,219,254,0.7)" }}>
            Accede a tu cuenta para descubrir nuestra colección exclusiva de productos.
          </p>
          <p className="mt-6 text-xs font-medium" style={{ color: "rgba(148,163,184,0.5)" }}>
            ¿No tienes cuenta?{" "}
            <a href="/" style={{ color: "#93c5fd" }} className="hover:underline">
              Visita la tienda
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
