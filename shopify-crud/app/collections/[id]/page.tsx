import Link from "next/link"
import { notFound } from "next/navigation"
import { StorefrontHeader } from "@/components/StorefrontHeader"
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
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <StorefrontHeader />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors hover:text-blue-600"
          style={{ color: "#64748b" }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Todas las colecciones
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "#0f172a" }}>
            {col.name}
          </h1>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {FIELD_LABELS[col.rule_field] ?? col.rule_field}: {col.rule_value}
          </p>
        </div>

        <CollectionFilters products={products} />
      </main>
    </div>
  )
}
