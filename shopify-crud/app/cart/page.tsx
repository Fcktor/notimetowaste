"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CartDrawer } from "@/components/CartDrawer";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

const FIELDS = [
  { name: "name" as const,    label: "Nombre completo",  placeholder: "Juan García",        type: "text",  icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { name: "email" as const,   label: "Email",            placeholder: "juan@ejemplo.com",   type: "email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { name: "phone" as const,   label: "Teléfono",         placeholder: "+51 999 000 000",    type: "tel",   icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
  { name: "address" as const, label: "Dirección",        placeholder: "Av. Principal 123",  type: "text",  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { name: "city" as const,    label: "Ciudad",           placeholder: "Lima",               type: "text",  icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
];

const CARD_STYLE = {
  background: "#FFFFFF",
  border: "1px solid #EAEAEA",
  borderRadius: "0.75rem",
};

const INPUT_STYLE = {
  background: "#F1F0ED",
  border: "1px solid #EAEAEA",
  borderRadius: "0.375rem",
  padding: "0.65rem 0.875rem 0.65rem 2.5rem",
  fontSize: "0.875rem",
  color: "#2F3437",
  width: "100%",
  outline: "none",
};

export default function CartPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", address: "", city: "" });
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderedName, setOrderedName] = useState("");
  const [orderedEmail, setOrderedEmail] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOrderedName(form.name);
    setOrderedEmail(form.email);
    setTimeout(() => { setLoading(false); setOrdered(true); clearCart(); }, 1500);
  }

  if (ordered) {
    return (
      <div className="min-h-screen" style={{ background: "#FBFBFA" }}>
        <StorefrontHeader />
        <CartDrawer />
        <div className="flex items-center justify-center min-h-[80vh] p-6">
          <div className="p-10 text-center max-w-sm w-full" style={CARD_STYLE}>
            <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center"
              style={{ background: "var(--status-success-bg)", borderRadius: "0.5rem" }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--status-success-fg)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display italic text-2xl mb-3" style={{ color: "#2F3437", fontWeight: 600 }}>
              ¡Pedido recibido!
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#787774" }}>
              Gracias <span style={{ color: "#2F3437" }}>{orderedName}</span>, te contactaremos pronto al correo{" "}
              <span style={{ color: "var(--status-success-fg)" }}>{orderedEmail}</span>.
            </p>
            <Link href="/"
              className="inline-block px-6 py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-200 bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98] rounded-lg">
              Seguir explorando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "#FBFBFA" }}>
        <StorefrontHeader />
        <CartDrawer />
        <div className="flex items-center justify-center min-h-[80vh] p-6">
          <div className="p-10 text-center" style={CARD_STYLE}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mx-auto mb-5" style={{ opacity: 0.2 }}>
              <circle cx="16" cy="16" r="14" stroke="#787774" strokeWidth="1" />
              <line x1="16" y1="4" x2="16" y2="7.5" stroke="#787774" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="16" x2="16" y2="9" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
              <line x1="16" y1="16" x2="21" y2="16" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <p className="text-sm mb-5" style={{ color: "#787774" }}>Tu carrito está vacío.</p>
            <Link href="/"
              className="inline-block px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-200 bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98] rounded-lg">
              Ver colección
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FBFBFA" }}>
      <StorefrontHeader />
      <CartDrawer />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: "#787774" }}>
            Checkout
          </p>
          <h1 className="font-display italic" style={{ fontSize: "2.5rem", color: "#2F3437", fontWeight: 400 }}>
            Finalizar compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleOrder} className="lg:col-span-3 space-y-4">
            <div className="p-6 space-y-4" style={CARD_STYLE}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: "#787774" }}>
                Datos de contacto
              </p>
              {FIELDS.slice(0, 3).map((f) => (
                <div key={f.name} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(120,119,116,0.5)" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </span>
                  <input
                    name={f.name} type={f.type} value={form[f.name]}
                    onChange={handleChange} required placeholder={f.placeholder}
                    style={INPUT_STYLE}
                    onFocus={e => (e.target.style.borderColor = "#787774")}
                    onBlur={e => (e.target.style.borderColor = "#EAEAEA")}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 space-y-4" style={CARD_STYLE}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: "#787774" }}>
                Dirección de envío
              </p>
              {FIELDS.slice(3).map((f) => (
                <div key={f.name} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(120,119,116,0.5)" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </span>
                  <input
                    name={f.name} type={f.type} value={form[f.name]}
                    onChange={handleChange} required placeholder={f.placeholder}
                    style={INPUT_STYLE}
                    onFocus={e => (e.target.style.borderColor = "#787774")}
                    onBlur={e => (e.target.style.borderColor = "#EAEAEA")}
                  />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 text-xs uppercase tracking-[0.14em] transition-all duration-200 disabled:opacity-50 bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98] rounded-lg"
              style={{ fontFamily: "var(--font-geist-sans)" }}>
              {loading ? "Procesando..." : "Confirmar pedido →"}
            </button>
          </form>

          {/* Resumen */}
          <div className="lg:col-span-2">
            <div className="p-5 sticky top-24" style={CARD_STYLE}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-5" style={{ color: "#787774" }}>
                Resumen
              </p>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 overflow-hidden flex-shrink-0"
                      style={{ background: "#F1F0ED", border: "1px solid #EAEAEA", borderRadius: "0.25rem" }}>
                      {item.image_link && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_link} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: "#2F3437" }}>{item.title}</p>
                      <p className="text-[10px] mt-0.5 tabular-nums" style={{ color: "rgba(120,119,116,0.6)" }}>x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: "#111111" }}>
                      S/ {(item.price * item.quantity).toLocaleString("es-PE")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4" style={{ borderTop: "1px solid #EAEAEA" }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#787774" }}>Subtotal</span>
                  <span className="text-sm tabular-nums" style={{ color: "#2F3437" }}>S/ {total.toLocaleString("es-PE")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#787774" }}>Envío</span>
                  <span className="text-xs" style={{ color: "#787774" }}>A coordinar</span>
                </div>
                <div className="flex justify-between items-center pt-3" style={{ borderTop: "1px solid #EAEAEA" }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: "#787774" }}>Total</span>
                  <span className="text-2xl font-semibold tabular-nums" style={{ color: "#111111", fontFamily: "var(--font-geist-sans)" }}>
                    S/ {total.toLocaleString("es-PE")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
