"use client"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useCart } from "./CartProvider"

export function StorefrontHeader() {
  const { data: session } = useSession()
  const { count, setIsOpen } = useCart()

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "#ffffff",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #e8edf2",
        boxShadow: "0 1px 12px rgba(7,16,48,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              boxShadow: "0 0 16px rgba(59,130,246,0.45)",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span
            className="text-sm font-bold tracking-wide"
            style={{ letterSpacing: "0.08em", color: "#0f172a" }}
          >
            REECH STORE
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: "#1d4ed8",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              Panel Admin
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs hidden sm:block" style={{ color: "#64748b" }}>
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ color: "#64748b", background: "#f1f5f9", border: "1px solid #e2e8f0" }}
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg transition-all text-white"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
              }}
            >
              Iniciar sesión
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
            style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#334155",
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#3b82f6", color: "white", boxShadow: "0 2px 8px rgba(59,130,246,0.5)" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
