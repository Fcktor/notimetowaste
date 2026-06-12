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

  return (
    <button
      onClick={handleAdd}
      disabled={!inStock}
      className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{
        background: inStock ? "linear-gradient(135deg, #1d4ed8, #3b82f6)" : "#1e293b",
        boxShadow: inStock ? "0 4px 20px rgba(59,130,246,0.35)" : "none",
      }}
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {inStock ? "Agregar al carrito" : "Agotado"}
    </button>
  )
}
