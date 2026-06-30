"use client"
import { useCart } from "./CartProvider"

interface Watch {
  id: string
  brand: string
  model: string
  price: number
  image_url?: string | null
  stock: number
}

export function AddToCartButton({ product, inStock }: { product: Watch; inStock: boolean }) {
  const { addItem, setIsOpen } = useCart()

  function handleAdd() {
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

  if (!inStock) return null

  return (
    <button
      onClick={handleAdd}
      className="flex items-center justify-center gap-2 w-full py-3 text-[10px] uppercase tracking-[0.14em] transition-all duration-200"
      style={{
        color: "rgba(122,110,100,0.55)",
        border: "1px solid rgba(122,110,100,0.15)",
        borderRadius: "0.25rem",
        fontFamily: "var(--font-dm-sans)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "#EDE8DF"
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,163,90,0.25)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(122,110,100,0.55)"
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(122,110,100,0.15)"
      }}
    >
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      Añadir al carrito
    </button>
  )
}
