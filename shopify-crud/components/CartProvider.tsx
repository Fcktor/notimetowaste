"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: string
  title: string
  price: number
  image_link: string | null
  quantity: number
  maxStock: number | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be inside CartProvider")
  return ctx
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("cart")
      if (saved) {
        const parsed = JSON.parse(saved)
        setItems(parsed.map((i: CartItem) => ({ ...i, maxStock: i.maxStock ?? null })))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items, mounted])

  function addItem(product: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        const max = existing.maxStock
        if (max != null && existing.quantity >= max) return prev
        return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsOpen(true)
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id)
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const capped = i.maxStock != null ? Math.min(qty, i.maxStock) : qty
        return { ...i, quantity: capped }
      })
    )
  }

  function clearCart() {
    setItems([])
    localStorage.removeItem("cart")
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  )
}
