import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CF_UPDATE, CF_DELETE } from "@/lib/config"
import { sendChatMessage, productUpdatedMessage, productDeletedMessage, lowStockMessage } from "@/lib/googleChat"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const res = await fetch(CF_UPDATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: decodeURIComponent(id), ...body }),
  })
  const data = await res.json()

  if (res.ok && body.brand && body.model) {
    await sendChatMessage(productUpdatedMessage(body.brand, body.model))
    const stock = Number(body.stock)
    const threshold = Number(body.stock_min_threshold ?? 5)
    if (!isNaN(stock) && !isNaN(threshold) && stock <= threshold) {
      await sendChatMessage(lowStockMessage(`${body.brand} ${body.model}`, stock))
    }
  }

  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { id } = await params
  const { productName } = await req.json().catch(() => ({ productName: "" }))

  const res = await fetch(CF_DELETE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: decodeURIComponent(id) }),
  })
  const data = await res.json()

  if (res.ok && productName) {
    await sendChatMessage(productDeletedMessage(productName))
  }

  return NextResponse.json(data, { status: res.status })
}
