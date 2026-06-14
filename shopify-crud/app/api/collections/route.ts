import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getCollections, createCollection, matchesRule } from "@/lib/collectionsStore"
import { CF_GET } from "@/lib/config"
import { sendChatMessage, collectionCreatedMessage } from "@/lib/googleChat"

export async function GET() {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const collections = getCollections()

  // Obtener productos para calcular conteos y stock por colección
  try {
    const res = await fetch(CF_GET, { cache: "no-store" })
    const data = await res.json()
    const products: Array<Record<string, unknown>> = data.products ?? data ?? []

    const enriched = collections.map((col) => {
      const matches = products.filter(p => matchesRule(p, col.rule_field, col.rule_value))
      const totalStock = matches.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
      const lowStock = matches.filter(
        (p) => Number(p.stock) <= (Number(p.stock_min_threshold) || 5)
      ).length
      return { ...col, product_count: matches.length, total_stock: totalStock, low_stock_count: lowStock }
    })

    return NextResponse.json({ collections: enriched })
  } catch {
    return NextResponse.json({ collections: collections.map(c => ({ ...c, product_count: 0, total_stock: 0, low_stock_count: 0 })) })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { name, rule_field, rule_value } = await req.json()
  if (!name || !rule_field || !rule_value)
    return NextResponse.json({ error: "name, rule_field y rule_value son requeridos" }, { status: 400 })

  const collection = createCollection(name.trim(), rule_field, rule_value.trim())
  await sendChatMessage(collectionCreatedMessage(name.trim(), rule_field, rule_value.trim()))
  return NextResponse.json({ success: true, collection }, { status: 201 })
}
