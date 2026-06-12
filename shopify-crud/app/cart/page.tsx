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
    setTimeout(() => {
      setLoading(false);
      setOrdered(true);
      clearCart();
    }, 1500);
  }

  if (ordered) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#071030" }}>
        <BlobBg />
        <StorefrontHeader />
        <CartDrawer />
        <div className="flex items-center justify-center min-h-[80vh] p-6 relative z-10">
          <div className="store-card p-10 text-center max-w-sm w-full">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #d1fae5, #ecfdf5)", border: "1px solid #a7f3d0" }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#0f172a" }}>¡Pedido recibido!</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Gracias <span style={{ color: "#0f172a", fontWeight: 600 }}>{orderedName}</span>, te contactaremos pronto al correo{" "}
              <span style={{ color: "#1d4ed8" }}>{orderedEmail}</span>.
            </p>
            <Link href="/">
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 4px 20px rgba(59,130,246,0.3)" }}
              >
                Seguir comprando
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#071030" }}>
        <BlobBg />
        <StorefrontHeader />
        <CartDrawer />
        <div className="flex items-center justify-center min-h-[80vh] p-6 relative z-10">
          <div className="store-card p-10 text-center">
            <p className="text-sm mb-4" style={{ color: "#64748b" }}>Tu carrito está vacío.</p>
            <Link href="/">
              <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                Ver productos
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#071030" }}>
      <BlobBg />
      <StorefrontHeader />
      <CartDrawer />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(148,163,184,0.6)" }}>
            Checkout
          </p>
          <h1 className="text-4xl font-bold text-white tracking-tight">Finalizar compra</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleOrder} className="lg:col-span-3 space-y-4">
            <div className="store-card p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Datos de contacto
              </p>
              {FIELDS.slice(0, 3).map((f) => (
                <div key={f.name} className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </span>
                  <input
                    name={f.name}
                    type={f.type}
                    value={form[f.name]}
                    onChange={handleChange}
                    required
                    placeholder={f.placeholder}
                    className="input-store"
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              ))}
            </div>

            <div className="store-card p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                Dirección de envío
              </p>
              {FIELDS.slice(3).map((f) => (
                <div key={f.name} className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </span>
                  <input
                    name={f.name}
                    type={f.type}
                    value={form[f.name]}
                    onChange={handleChange}
                    required
                    placeholder={f.placeholder}
                    className="input-store"
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}
            >
              {loading ? "Procesando..." : "Confirmar pedido →"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="store-card p-5 sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "#94a3b8" }}>
                Resumen del pedido
              </p>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
                    >
                      {item.image_link && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_link} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "#0f172a" }}>{item.title}</p>
                      <p className="text-[10px]" style={{ color: "#94a3b8" }}>x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "#1d4ed8" }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4" style={{ borderTop: "1px solid #f1f5f9" }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#64748b" }}>Subtotal</span>
                  <span className="text-sm font-semibold" style={{ color: "#334155" }}>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#64748b" }}>Envío</span>
                  <span className="text-xs font-semibold" style={{ color: "#10b981" }}>Gratis</span>
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                  <span className="text-sm font-bold" style={{ color: "#0f172a" }}>Total</span>
                  <span className="text-2xl font-bold" style={{ color: "#1d4ed8" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BlobBg() {
  return (
    <div className="pointer-events-none select-none" aria-hidden>
      <div
        className="blob-animate absolute"
        style={{ width: 480, height: 480, top: -100, right: -60, background: "linear-gradient(135deg, #e8d8a0 0%, #c8a85a 20%, #7ba5e8 55%, #1a2f8f 100%)", opacity: 0.8, filter: "blur(2px)" }}
      />
      <div
        className="absolute"
        style={{ width: 500, height: 350, bottom: -80, left: -120, background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.18) 0%, transparent 70%)", filter: "blur(40px)" }}
      />
    </div>
  );
}
