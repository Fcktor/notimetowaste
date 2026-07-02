"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useCart } from "./CartProvider"

export function StorefrontHeader() {
  const { data: session } = useSession()
  const { count, setIsOpen } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: scrolled ? "rgba(251,251,250,0.93)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? "#EAEAEA" : "transparent"}`,
        transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden>
            <circle cx="16" cy="16" r="14" stroke="#111111" strokeWidth="1.2" />
            <circle cx="16" cy="16" r="10" stroke="#111111" strokeWidth="0.6" />
            <line x1="16" y1="4" x2="16" y2="7.5" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="28" y1="16" x2="24.5" y2="16" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="16" y1="28" x2="16" y2="24.5" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="4" y1="16" x2="7.5" y2="16" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="16" y1="16" x2="16" y2="9" stroke="#111111" strokeWidth="1" strokeLinecap="round" />
            <line x1="16" y1="16" x2="21" y2="16" stroke="#111111" strokeWidth="1" strokeLinecap="round" />
            <circle cx="16" cy="16" r="1.4" fill="#111111" />
          </svg>
          <span
            className="font-display text-xl tracking-[0.18em] uppercase"
            style={{ color: "#2F3437", fontStyle: "italic", letterSpacing: "0.2em" }}
          >
            No Time To Waste
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden sm:flex items-center gap-8">
          {[
            { href: "/", label: "Colección" },
            { href: "/collections", label: "Categorías" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs uppercase tracking-[0.14em] transition-colors duration-200"
              style={{ color: "#787774", fontFamily: "var(--font-geist-sans)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
              onMouseLeave={e => (e.currentTarget.style.color = "#787774")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-xs uppercase tracking-widest px-3 py-1.5 transition-all duration-200"
              style={{
                color: "#111111",
                border: "1px solid #EAEAEA",
                borderRadius: "0.375rem",
                letterSpacing: "0.1em",
              }}
            >
              Admin
            </Link>
          )}

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs uppercase tracking-widest px-3 py-1.5 transition-all duration-200"
              style={{
                color: "#787774",
                border: "1px solid #EAEAEA",
                borderRadius: "0.375rem",
              }}
            >
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs uppercase tracking-widest px-3 py-1.5 transition-all duration-200"
              style={{
                color: "#787774",
                border: "1px solid #EAEAEA",
                borderRadius: "0.375rem",
              }}
            >
              Ingresar
            </Link>
          )}

          {/* Cart */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 transition-all duration-200"
            style={{ color: "#787774" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
            onMouseLeave={e => (e.currentTarget.style.color = "#787774")}
            aria-label="Ver carrito"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-semibold flex items-center justify-center"
                style={{ background: "#111111", color: "#FFFFFF" }}
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
