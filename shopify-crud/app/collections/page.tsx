import Link from "next/link"
import { StorefrontHeader } from "@/components/StorefrontHeader"
import { getCollections, FIELD_LABELS, matchesRule } from "@/lib/collectionsStore"
import { CF_GET } from "@/lib/config"

async function getEnrichedCollections() {
  const collections = getCollections()
  try {
    const res = await fetch(CF_GET, { cache: "no-store" })
    const data = await res.json()
    const products: Array<Record<string, unknown>> = data.products ?? data ?? []
    return collections.map(col => ({
      ...col,
      product_count: products.filter(p => matchesRule(p, col.rule_field, col.rule_value)).length,
    }))
  } catch {
    return collections.map(col => ({ ...col, product_count: 0 }))
  }
}

export default async function CollectionsPage() {
  const collections = await getEnrichedCollections()

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "#0f172a" }}>
            Colecciones
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Explora nuestra selección de relojes organizados por estilo y características
          </p>
        </div>

        {collections.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: "white", border: "1px solid #e2e8f0" }}
          >
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              No hay colecciones disponibles por el momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(col => (
              <Link key={col.id} href={`/collections/${col.id}`} className="group">
                <div
                  className="rounded-2xl p-6 h-full flex flex-col justify-between transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5"
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
                    >
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2
                      className="text-lg font-bold mb-1 transition-colors group-hover:text-blue-600"
                      style={{ color: "#0f172a" }}
                    >
                      {col.name}
                    </h2>
                    <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
                      {FIELD_LABELS[col.rule_field] ?? col.rule_field}: {col.rule_value}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-full"
                      style={{ background: "#eff6ff", color: "#1d4ed8" }}
                    >
                      {col.product_count} {col.product_count === 1 ? "reloj" : "relojes"}
                    </span>
                    <span
                      className="text-sm font-medium flex items-center gap-1 transition-colors group-hover:text-blue-600"
                      style={{ color: "#94a3b8" }}
                    >
                      Ver colección
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
