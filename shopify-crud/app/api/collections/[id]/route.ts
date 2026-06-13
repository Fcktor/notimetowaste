import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getCollections, deleteCollection } from "@/lib/collectionsStore"
import { CF_GET } from "@/lib/config"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { id } = await params
  const collections = getCollections()
  const col = collections.find(c => c.id === id)
  if (!col) return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 })

  const res = await fetch(CF_GET, { cache: "no-store" })
  const data = await res.json()
  const products: Array<Record<string, unknown>> = data.products ?? data ?? []

  const matches = products.filter(
    (p) => String(p[col.rule_field] ?? "").toLowerCase() === col.rule_value.toLowerCase()
  )
  const totalStock = matches.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)

  return NextResponse.json({ collection: col, products: matches, total_stock: totalStock })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { id } = await params
  const ok = deleteCollection(id)
  if (!ok) return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 })
  return NextResponse.json({ success: true })
}
