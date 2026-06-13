import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getCollections } from "@/lib/collectionsStore"
import { CollectionsPanel } from "@/components/CollectionsPanel"
import { CF_GET } from "@/lib/config"

async function getEnrichedCollections() {
  const collections = getCollections()
  try {
    const res = await fetch(CF_GET, { cache: "no-store" })
    const data = await res.json()
    const products: Array<Record<string, unknown>> = data.products ?? data ?? []
    return collections.map(col => {
      const matches = products.filter(
        p => String(p[col.rule_field] ?? "").toLowerCase() === col.rule_value.toLowerCase()
      )
      return {
        ...col,
        product_count: matches.length,
        total_stock: matches.reduce((s, p) => s + (Number(p.stock) || 0), 0),
        low_stock_count: matches.filter(p => Number(p.stock) <= (Number(p.stock_min_threshold) || 5)).length,
      }
    })
  } catch {
    return collections.map(c => ({ ...c, product_count: 0, total_stock: 0, low_stock_count: 0 }))
  }
}

export default async function CollectionsPage() {
  const session = await auth()
  if (!session || session.user?.role !== "admin") redirect("/login")

  const collections = await getEnrichedCollections()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #8b5cf6, #6366f1)" }} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase" style={{ color: "#6d28d9" }}>
                SYS://COLLECTIONS
              </span>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#8b5cf6", boxShadow: "0 0 6px rgba(139,92,246,0.8)" }} />
            </div>
          </div>
          <div className="flex items-baseline gap-3 pl-4">
            <h1 className="text-2xl font-bold tracking-tight" style={{ background: "linear-gradient(90deg, #c4b5fd, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Colecciones
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}>
              {collections.length} colecciones
            </span>
          </div>
        </div>
      </div>

      <CollectionsPanel initialCollections={collections} />
    </div>
  )
}
