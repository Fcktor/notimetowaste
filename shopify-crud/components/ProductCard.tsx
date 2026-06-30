"use client"
import Link from "next/link"
import { useCart } from "./CartProvider"
import { WHATSAPP_NUMBER } from "@/lib/config"

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

export function ProductCard({ product }: { product: Watch }) {
  const { addItem, setIsOpen } = useCart()
  const inStock = product.available && product.stock > 0

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null

  const whatsappText = encodeURIComponent(
    `Hola! Me interesa el reloj ${product.brand} ${product.model} (S/ ${product.price}). ¿Está disponible?`
  )
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`

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

  return (
    <div className="store-card flex flex-col group">
      {/* ── Image ── */}
      <Link href={`/products/${encodeURIComponent(product.id)}`}>
        <div className="relative overflow-hidden" style={{ aspectRatio: "1/1", background: "#161310" }}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={`${product.brand} ${product.model}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.2 }}>
                <circle cx="16" cy="16" r="14" stroke="#C4A35A" strokeWidth="1" />
                <line x1="16" y1="4" x2="16" y2="7.5" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="16" x2="16" y2="9" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
                <line x1="16" y1="16" x2="21" y2="16" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(12,11,9,0.6) 0%, transparent 55%)" }}
          >
            <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(196,163,90,0.9)" }}>
              Ver detalles
            </span>
          </div>

          {/* Agotado overlay */}
          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(12,11,9,0.55)" }}>
              <span
                className="text-[10px] uppercase tracking-widest px-3 py-1"
                style={{ color: "#7A6E64", border: "1px solid rgba(122,110,100,0.4)", borderRadius: "2px" }}
              >
                Sin stock
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <span
                className="text-[9px] uppercase tracking-widest px-2 py-0.5"
                style={{ background: "rgba(196,163,90,0.15)", color: "#C4A35A", border: "1px solid rgba(196,163,90,0.3)", borderRadius: "2px" }}
              >
                −{discount}%
              </span>
            )}
            {product.stock > 0 && product.stock <= 3 && (
              <span
                className="text-[9px] uppercase tracking-widest px-2 py-0.5"
                style={{ background: "rgba(239,68,68,0.12)", color: "#ef9090", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "2px" }}
              >
                Últimas {product.stock}
              </span>
            )}
          </div>

          {/* Condition badge */}
          {product.condition && inStock && (
            <div className="absolute top-3 right-3">
              <span
                className="text-[9px] uppercase tracking-widest px-2 py-0.5"
                style={{
                  background: "rgba(12,11,9,0.7)",
                  color: product.condition === "Vintage" ? "#C4A35A" : "rgba(237,232,223,0.55)",
                  border: `1px solid ${product.condition === "Vintage" ? "rgba(196,163,90,0.35)" : "rgba(237,232,223,0.12)"}`,
                  borderRadius: "2px",
                }}
              >
                {product.condition}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Brand & style */}
        <div className="flex items-center justify-between">
          <p
            className="text-[9px] uppercase tracking-[0.2em]"
            style={{ color: "#C4A35A", fontFamily: "var(--font-dm-sans)" }}
          >
            {product.brand}
          </p>
          {product.style && (
            <p
              className="text-[9px] uppercase tracking-wider"
              style={{ color: "rgba(122,110,100,0.7)" }}
            >
              {product.style}
            </p>
          )}
        </div>

        {/* Model name */}
        <div>
          <h3
            className="font-display text-xl leading-tight"
            style={{ color: "#C4A35A", fontWeight: 600, fontStyle: "italic" }}
          >
            {product.model}
          </h3>
          {product.movement && (
            <p className="text-[10px] mt-0.5" style={{ color: "#7A6E64" }}>{product.movement}</p>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto pt-2" style={{ borderTop: "1px solid rgba(196,163,90,0.1)" }}>
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="text-2xl font-semibold"
              style={{ color: "#C4A35A", fontFamily: "var(--font-dm-sans)" }}
            >
              S/ {product.price.toLocaleString("es-PE")}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs line-through" style={{ color: "rgba(122,110,100,0.55)" }}>
                S/ {product.compare_at_price.toLocaleString("es-PE")}
              </span>
            )}
          </div>

          {/* WhatsApp CTA — primary */}
          {inStock ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-200"
              style={{
                color: "#0C0B09",
                background: "#C4A35A",
                borderRadius: "0.25rem",
                fontFamily: "var(--font-dm-sans)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#B8963E" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#C4A35A" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.855L.057 23.882a.5.5 0 00.614.641l6.227-1.635A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.9 0-3.678-.513-5.2-1.407l-.373-.218-3.87 1.016 1.033-3.768-.24-.387A9.818 9.818 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
              </svg>
              Pedir por WhatsApp
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center w-full py-2.5 text-xs uppercase tracking-[0.14em]"
              style={{
                color: "rgba(122,110,100,0.4)",
                border: "1px solid rgba(122,110,100,0.15)",
                borderRadius: "0.25rem",
                cursor: "not-allowed",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Sin disponibilidad
            </button>
          )}

          {/* Cart icon — secondary, only for in-stock */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 text-[10px] uppercase tracking-widest transition-all duration-200"
              style={{ color: "rgba(122,110,100,0.5)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#EDE8DF" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(122,110,100,0.5)" }}
            >
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Añadir al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
