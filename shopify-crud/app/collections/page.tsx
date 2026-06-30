import Link from "next/link"
import { StorefrontHeader } from "@/components/StorefrontHeader"
import { CartDrawer } from "@/components/CartDrawer"
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
    <div className="min-h-screen" style={{ background: "#0C0B09" }}>
      <StorefrontHeader />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: "rgba(196,163,90,0.6)" }}>
            Categorías
          </p>
          <h1
            className="font-display italic leading-tight"
            style={{ fontSize: "3rem", color: "#EDE8DF", fontWeight: 400 }}
          >
            Colecciones
          </h1>
          <p className="text-sm mt-3" style={{ color: "#7A6E64" }}>
            Relojes organizados por estilo y características
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: "#7A6E64" }}>
              No hay colecciones disponibles por el momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(col => (
              <Link key={col.id} href={`/collections/${col.id}`} className="group">
                <div
                  className="p-6 h-full flex flex-col justify-between transition-all duration-300"
                  style={{
                    background: "#1C1916",
                    border: "1px solid rgba(196,163,90,0.1)",
                    borderRadius: "0.5rem",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,163,90,0.3)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,163,90,0.1)" }}
                >
                  <div>
                    {/* Icono reloj */}
                    <div className="mb-5">
                      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.4 }}>
                        <circle cx="16" cy="16" r="14" stroke="#C4A35A" strokeWidth="1" />
                        <line x1="16" y1="4" x2="16" y2="7" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="16" y1="16" x2="16" y2="9.5" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
                        <line x1="16" y1="16" x2="21" y2="16" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </div>

                    <h2
                      className="font-display italic text-xl mb-1.5 transition-colors duration-200"
                      style={{ color: "#C4A35A", fontWeight: 600 }}
                    >
                      {col.name}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgba(122,110,100,0.6)" }}>
                      {FIELD_LABELS[col.rule_field] ?? col.rule_field}: {col.rule_value}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid rgba(196,163,90,0.08)" }}>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,163,90,0.5)" }}>
                      {col.product_count} {col.product_count === 1 ? "reloj" : "relojes"}
                    </span>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#C4A35A" strokeWidth={1.5} style={{ opacity: 0.5, transition: "opacity 0.2s" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
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
