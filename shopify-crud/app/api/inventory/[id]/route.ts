import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CF_UPDATE, CF_GET } from "@/lib/config"
import { sendChatMessage, lowStockMessage, inventoryUpdatedMessage } from "@/lib/googleChat"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { id } = await params
  const { stock } = await req.json()

  if (stock == null || isNaN(Number(stock)) || Number(stock) < 0)
    return NextResponse.json({ error: "stock inválido" }, { status: 400 })

  const decodedId = decodeURIComponent(id)
  const newStock = Number(stock)

  // Obtener datos actuales del producto para el mensaje
  let productName = decodedId
  let oldStock = 0
  let threshold = 5
  try {
    const getRes = await fetch(CF_GET, { cache: "no-store" })
    if (getRes.ok) {
      const data = await getRes.json()
      const products: Array<{ id: string; brand: string; model: string; stock: number; stock_min_threshold: number }> = data.products ?? data ?? []
      const product = products.find((p) => p.id === decodedId)
      if (product) {
        productName = `${product.brand} ${product.model}`
        oldStock = product.stock
        threshold = product.stock_min_threshold ?? 5
      }
    }
  } catch { /* continuar sin datos del producto */ }

  const res = await fetch(CF_UPDATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: decodedId, stock: newStock }),
  })
  const data = await res.json()

  if (res.ok) {
    if (newStock <= threshold) {
      sendChatMessage(lowStockMessage(productName, newStock))
    } else if (oldStock !== newStock) {
      sendChatMessage(inventoryUpdatedMessage(productName, oldStock, newStock))
    }
  }

  return NextResponse.json(data, { status: res.status })
}
