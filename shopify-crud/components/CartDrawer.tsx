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
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[22rem] z-50 flex flex-col"
        style={{
          background: "#FBFBFA",
          borderLeft: "1px solid #EAEAEA",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid #EAEAEA" }}
        >
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: "#787774" }}>
              Tu carrito
            </p>
            <h2 className="text-sm flex items-center gap-2" style={{ color: "#2F3437" }}>
              Mi carrito
              <span
                className="text-[9px] px-2 py-0.5 rounded-full tabular-nums"
                style={{ background: "#F1F0ED", color: "#111111", border: "1px solid #EAEAEA" }}
              >
                {count}
              </span>
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 flex items-center justify-center transition-all duration-150"
            style={{ color: "rgba(120,119,116,0.6)", border: "1px solid #EAEAEA", borderRadius: "0.25rem" }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.2 }}>
                <circle cx="16" cy="16" r="13" stroke="#787774" strokeWidth="1" />
                <line x1="16" y1="5" x2="16" y2="8" stroke="#787774" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="16" x2="16" y2="10" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
                <line x1="16" y1="16" x2="21" y2="16" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
              </svg>
              <p className="text-sm" style={{ color: "#787774" }}>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 p-3"
                style={{ background: "#FFFFFF", border: "1px solid #EAEAEA", borderRadius: "0.375rem" }}
              >
                {/* Image */}
                <div
                  className="w-14 h-14 overflow-hidden flex-shrink-0"
                  style={{ background: "#F1F0ED", borderRadius: "0.25rem" }}
                >
                  {item.image_link ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_link} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(120,119,116,0.3)" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: "#2F3437" }}>{item.title}</p>
                  <p className="text-sm font-semibold mt-0.5 tabular-nums" style={{ color: "#111111" }}>
                    S/ {item.price.toLocaleString("es-PE")}
                  </p>

                  {/* Qty + delete */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center text-xs transition-all duration-150"
                      style={{ color: "#787774", border: "1px solid #EAEAEA", borderRadius: "2px" }}
                    >
                      −
                    </button>
                    <span className="text-xs w-4 text-center tabular-nums" style={{ color: "#2F3437" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      disabled={item.maxStock != null && item.quantity >= item.maxStock}
                      className="w-5 h-5 flex items-center justify-center text-xs transition-all duration-150 disabled:opacity-30"
                      style={{ color: "#787774", border: "1px solid #EAEAEA", borderRadius: "2px" }}
                      title={item.maxStock != null && item.quantity >= item.maxStock ? `Máximo ${item.maxStock} en stock` : undefined}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto flex items-center justify-center transition-all duration-150"
                      style={{ color: "rgba(120,119,116,0.5)" }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
            className="px-5 py-5 space-y-3 flex-shrink-0"
            style={{ borderTop: "1px solid #EAEAEA" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "#787774" }}>Subtotal</span>
              <span className="text-xl font-semibold tabular-nums" style={{ color: "#111111", fontFamily: "var(--font-geist-sans)" }}>
                S/ {total.toLocaleString("es-PE")}
              </span>
            </div>
            <Link href="/cart" onClick={() => setIsOpen(false)}>
              <button
                className="w-full py-3 text-xs uppercase tracking-[0.14em] transition-all duration-200 bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98] rounded-lg"
                style={{ fontFamily: "var(--font-geist-sans)" }}
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
