"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { WatchClock } from "@/components/WatchClock";

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
  );
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
};

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
    <div className="min-h-screen flex" style={{ background: "#0C0B09" }}>
      {/* ──── LEFT: Form ──── */}
      <div
        className="w-full lg:w-5/12 flex flex-col items-center justify-center p-10"
        style={{ background: "#0F0E0C", borderRight: "1px solid rgba(196,163,90,0.08)", minHeight: "100vh" }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-12">
            <WatchLogo />
          </div>

          {/* Heading */}
          <h2
            className="font-display italic mb-2"
            style={{ fontSize: "2rem", color: "#EDE8DF", fontWeight: 400 }}
          >
            Bienvenido
          </h2>
          <p className="text-sm mb-8" style={{ color: "#7A6E64" }}>
            Inicia sesión para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(122,110,100,0.5)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email" value={form.email} required placeholder="Email"
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={INPUT_STYLE}
                onFocus={e => (e.target.style.borderColor = "rgba(196,163,90,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(196,163,90,0.15)")}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(122,110,100,0.5)" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password" value={form.password} required placeholder="Contraseña"
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={INPUT_STYLE}
                onFocus={e => (e.target.style.borderColor = "rgba(196,163,90,0.5)")}
                onBlur={e => (e.target.style.borderColor = "rgba(196,163,90,0.15)")}
              />
            </div>

            {error && (
              <p className="text-xs px-3 py-2.5" style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.25rem" }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 text-xs uppercase tracking-[0.14em] transition-all duration-200 disabled:opacity-50 mt-2"
              style={{ background: "#C4A35A", color: "#0C0B09", borderRadius: "0.25rem", fontFamily: "var(--font-dm-sans)" }}
            >
              {loading ? "Verificando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-5">
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: "#7A6E64" }}>
              <input type="checkbox" style={{ accentColor: "#C4A35A" }} />
              Recordarme
            </label>
          </div>

          <div
            className="mt-10 pt-6 space-y-2"
            style={{ borderTop: "1px solid rgba(196,163,90,0.08)" }}
          >
            <p className="text-xs" style={{ color: "#7A6E64" }}>
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="transition-colors duration-150" style={{ color: "#C4A35A" }}>
                Regístrate
              </Link>
            </p>
            <p className="text-xs" style={{ color: "#7A6E64" }}>
              ¿Solo quieres ver la tienda?{" "}
              <Link href="/" className="transition-colors duration-150" style={{ color: "#C4A35A" }}>
                Ir al catálogo
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ──── RIGHT: Brand panel ──── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col items-center justify-center gap-10" style={{ background: "#0C0B09" }}>
        {/* Ambient glow behind watch */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(196,163,90,0.07) 0%, transparent 65%)",
        }} />

        {/* Animated watch */}
        <div className="relative z-10">
          <WatchClock size={300} />
        </div>

        {/* Brand text */}
        <div className="relative z-10 text-center">
          <h1
            className="font-display italic leading-none"
            style={{ fontSize: "2rem", color: "rgba(237,232,223,0.55)", fontWeight: 400, letterSpacing: "0.04em" }}
          >
            No Time To Waste
          </h1>
          <p className="text-[10px] mt-3 uppercase tracking-[0.25em]" style={{ color: "rgba(196,163,90,0.4)" }}>
            Relojes que definen cada momento
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
