"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  {
    label: "Productos",
    href: "/admin",
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
      </svg>
    ),
  },
  {
    label: "Colecciones",
    href: "/admin/collections",
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Recursos",
    href: "/admin/resources",
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Base de datos",
    href: "/admin/database",
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    label: "Asistente",
    href: "/admin/chat",
    icon: (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-52 min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(196,163,90,0.1)",
        boxShadow: "4px 0 30px rgba(0,0,0,0.5), 1px 0 0 rgba(196,163,90,0.05)",
      }}
    >
      {/* Vertical glow line on the right border */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{ background: "linear-gradient(180deg, transparent, rgba(196,163,90,0.3) 30%, rgba(196,163,90,0.2) 70%, transparent)" }}
      />

      {/* Background dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(196,163,90,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "linear-gradient(180deg, transparent, black 15%, black 85%, transparent)",
        }}
      />

      {/* Logo */}
      <div className="relative px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center relative flex-shrink-0"
            style={{
              background: "rgba(196,163,90,0.08)",
              border: "1px solid rgba(196,163,90,0.3)",
            }}
          >
            {/* Clock SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 7v5l3 3" />
              <line x1="12" y1="3" x2="12" y2="4.5" strokeLinecap="round" />
              <line x1="12" y1="19.5" x2="12" y2="21" strokeLinecap="round" />
              <line x1="3" y1="12" x2="4.5" y2="12" strokeLinecap="round" />
              <line x1="19.5" y1="12" x2="21" y2="12" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-xs font-bold tracking-tight leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', 'Cormorant', Georgia, serif",
                fontStyle: "italic",
                color: "#C4A35A",
              }}
            >
              No Time To Waste
            </span>
            <span className="text-[9px] font-mono tracking-widest" style={{ color: "rgba(196,163,90,0.5)" }}>
              v2.4.1
            </span>
          </div>
        </div>
      </div>

      {/* Divider with glow */}
      <div className="mx-4 mb-4 relative">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,163,90,0.25), transparent)" }} />
      </div>

      {/* Label */}
      <p className="px-5 mb-2 text-[9px] font-mono font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(196,163,90,0.5)" }}>
        Admin
      </p>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 relative">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden"
              style={{
                color: active ? "#EDE8DF" : "#7A6E64",
                background: active ? "rgba(196,163,90,0.1)" : "transparent",
                border: active ? "1px solid rgba(196,163,90,0.2)" : "1px solid transparent",
                boxShadow: active ? "0 0 20px rgba(196,163,90,0.1), inset 0 0 20px rgba(196,163,90,0.05)" : "none",
              }}
            >
              {/* Active indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                  style={{ background: "#C4A35A", boxShadow: "0 0 8px rgba(196,163,90,0.8)" }}
                />
              )}
              {/* Hover shimmer */}
              <span
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(90deg, transparent, rgba(196,163,90,0.04), transparent)" }}
              />
              <span
                style={{ color: active ? "#C4A35A" : "#7A6E64" }}
                className="transition-all duration-200 relative z-10"
              >
                {l.icon}
              </span>
              <span className="transition-colors duration-200 group-hover:text-slate-300 relative z-10">{l.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Ver tienda */}
      <div className="px-3 mb-2 relative">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group w-full"
          style={{ color: "#7A6E64", border: "1px solid rgba(196,163,90,0.1)", background: "rgba(196,163,90,0.04)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#EDE8DF";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(196,163,90,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "#7A6E64";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(196,163,90,0.1)";
          }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Ver tienda
        </Link>
      </div>

      <div className="flex-1" />

      {/* Status indicator */}
      <div className="px-5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-neon inline-block" />
          <span className="text-[9px] font-mono" style={{ color: "rgba(196,163,90,0.5)" }}>SYNC ACTIVE</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,163,90,0.15), transparent)" }} />
      </div>

      {/* Footer */}
      <div className="px-4 pb-5 relative space-y-2">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{
            background: "rgba(196,163,90,0.05)",
            border: "1px solid rgba(196,163,90,0.1)",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: "#C4A35A",
              color: "#0C0B09",
            }}
          >
            R
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold truncate" style={{ color: "#EDE8DF" }}>No Time To Waste</span>
            <span className="text-[9px] font-mono" style={{ color: "rgba(196,163,90,0.5)" }}>ADMIN</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group"
          style={{ color: "#475569", background: "transparent", border: "1px solid transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#475569";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
