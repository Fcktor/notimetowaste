import Link from "next/link"
import { notFound } from "next/navigation"
import { StorefrontHeader } from "@/components/StorefrontHeader"
import { CartDrawer } from "@/components/CartDrawer"
import { CollectionFilters } from "@/components/CollectionFilters"
import { getCollections, FIELD_LABELS, matchesRule } from "@/lib/collectionsStore"
import { CF_GET } from "@/lib/config"

interface Product {
  id: string
  sku: string
  brand: string
  model: string
  price: number
  compare_at_price?: number | null
  stock: number
  condition: string
  style: string
  movement?: string | null
  gender?: string | null
  image_url?: string | null
  available: boolean
}

export default async function PublicCollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const collections = getCollections()
  const col = collections.find(c => c.id === id)
  if (!col) notFound()

  let products: Product[] = []
  try {
    const res = await fetch(CF_GET, { cache: "no-store" })
    const data = await res.json()
    const all: Array<Record<string, unknown>> = data.products ?? data ?? []
    products = all
      .filter(p => matchesRule(p, col.rule_field, col.rule_value))
      .map(p => ({
        id: String(p.id),
        sku: String(p.sku ?? ""),
        brand: String(p.brand ?? ""),
        model: String(p.model ?? p.title ?? ""),
        price: Number(p.price) || 0,
        compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : null,
        stock: Number(p.stock) || 0,
        condition: String(p.condition ?? ""),
        style: String(p.style ?? ""),
        movement: p.movement != null ? String(p.movement) : null,
        gender: p.gender != null ? String(p.gender) : null,
        image_url: p.image_url != null ? String(p.image_url) : null,
        available: Boolean(p.available ?? (Number(p.stock) > 0)),
      }))
  } catch {
    products = []
  }

  return (
    <div className="min-h-screen" style={{ background: "#0C0B09" }}>
      <StorefrontHeader />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] mb-10 transition-colors duration-200"
          style={{ color: "rgba(122,110,100,0.6)" }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Todas las colecciones
        </Link>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(196,163,90,0.55)" }}>
            {FIELD_LABELS[col.rule_field] ?? col.rule_field}: {col.rule_value}
          </p>
          <h1
            className="font-display italic leading-tight"
            style={{ fontSize: "2.75rem", color: "#C4A35A", fontWeight: 600 }}
          >
            {col.name}
          </h1>
        </div>

        <CollectionFilters products={products} />
      </main>
    </div>
  )
}
