"use client"
import Link from "next/link"
import { useCart } from "./CartProvider"

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, count } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(7,16,48,0.55)", backdropFilter: "blur(6px)" }}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-96 z-50 flex flex-col"
        style={{
          background: "#ffffff",
          borderLeft: "1px solid #e2e8f0",
          boxShadow: "-20px 0 60px rgba(7,16,48,0.25)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid #f1f5f9" }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#94a3b8" }}>
              Tu carrito
            </p>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: "#0f172a" }}>
              Mi carrito
              <span
                className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ background: "#eff6ff", color: "#3b82f6" }}
              >
                {count}
              </span>
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ color: "#94a3b8", background: "#f8faff", border: "1px solid #e2e8f0" }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: "#64748b" }}>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3 rounded-xl"
                style={{ background: "#f8faff", border: "1px solid #e2e8f0" }}
              >
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: "#f1f5f9" }}
                >
                  {item.image_link ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_link} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#0f172a" }}>{item.title}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: "#1d4ed8" }}>${item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                      style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
                    >
                      −
                    </button>
                    <span className="text-xs font-bold w-4 text-center" style={{ color: "#0f172a" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.maxStock != null && item.quantity >= item.maxStock}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
                      title={item.maxStock != null && item.quantity >= item.maxStock ? `Máximo ${item.maxStock} en stock` : undefined}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{ color: "#ef4444", background: "#fef2f2" }}
                    >
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-6 py-5 space-y-3"
            style={{ borderTop: "1px solid #f1f5f9" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "#64748b" }}>Subtotal</span>
              <span className="text-lg font-bold" style={{ color: "#0f172a" }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              <button
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                }}
              >
                Proceder al pago →
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
