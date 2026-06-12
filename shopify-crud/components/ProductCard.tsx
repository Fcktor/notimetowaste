"use client"
import Link from "next/link"
import { useCart } from "./CartProvider"

interface Watch {
  id: string
  sku: string
  brand: string
  model: string
  price: number
  compare_at_price?: number | null
  stock: number
  condition: string
  style: string
  movement?: string | null
  gender?: string | null
  image_url?: string | null
  available: boolean
}

const STYLE_COLORS: Record<string, string> = {
  Sport:  "#60a5fa",
  Dress:  "#c084fc",
  Casual: "#94a3b8",
}

export function ProductCard({ product }: { product: Watch }) {
  const { addItem, setIsOpen } = useCart()
  const inStock = product.available && product.stock > 0

  function handleAddToCart() {
    if (!inStock) return
    addItem({
      id: product.id,
      title: `${product.brand} ${product.model}`,
      price: product.price,
      image_link: product.image_url ?? null,
      maxStock: product.stock,
    })
    setIsOpen(true)
  }

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null

  return (
    <div className="store-card flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/products/${encodeURIComponent(product.id)}`}>
      <div
        className="relative overflow-hidden bg-gray-50 group/img"
        style={{ aspectRatio: "1/1", cursor: "pointer" }}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={`${product.brand} ${product.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1}>
              <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(7,16,48,0.45) 0%, transparent 60%)" }}>
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver detalles
          </span>
        </div>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca" }}>
              Agotado
            </span>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.stock > 0 && product.stock <= 3 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#d97706" }}>
              ¡Solo {product.stock} en stock!
            </span>
          )}
          {discount && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fce7f3", color: "#db2777" }}>
              -{discount}%
            </span>
          )}
        </div>

        {/* Condition badge top-right */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={
              product.condition === "Vintage"
                ? { background: "#fef3c7", color: "#d97706" }
                : { background: "#ecfdf5", color: "#059669" }
            }
          >
            {product.condition}
          </span>
        </div>
      </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
              {product.brand}
            </p>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ color: STYLE_COLORS[product.style] ?? "#94a3b8", background: "rgba(255,255,255,0.05)" }}
            >
              {product.style}
            </span>
          </div>
          <h3 className="text-sm font-semibold leading-snug" style={{ color: "#0f172a" }}>
            {product.model}
          </h3>
          {product.movement && (
            <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{product.movement}</p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-xl font-bold" style={{ color: "#1d4ed8" }}>
              S/ {product.price}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs line-through ml-1.5" style={{ color: "#94a3b8" }}>
                S/ {product.compare_at_price}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: inStock ? "linear-gradient(135deg, #1d4ed8, #3b82f6)" : "#e2e8f0",
              boxShadow: inStock ? "0 2px 12px rgba(59,130,246,0.35)" : "none",
              color: inStock ? "white" : "#94a3b8",
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
