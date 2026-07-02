import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getCollections, FIELD_LABELS, matchesRule } from "@/lib/collectionsStore"
import { CF_GET } from "@/lib/config"

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin") redirect("/login")

  const { id } = await params
  const collections = getCollections()
  const col = collections.find(c => c.id === id)
  if (!col) redirect("/admin/collections")

  const res = await fetch(CF_GET, { cache: "no-store" })
  const data = await res.json()
  const products: Array<Record<string, unknown>> = data.products ?? data ?? []
  const matches = products.filter(p => matchesRule(p, col.rule_field, col.rule_value))
  const totalStock = matches.reduce((s, p) => s + (Number(p.stock) || 0), 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/collections" className="text-xs font-mono mb-4 inline-flex items-center gap-1.5 transition-colors" style={{ color: "var(--muted-foreground)" }}>
          ← Colecciones
        </Link>
        <div className="flex items-center gap-3 mt-2 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: "var(--primary)" }} />
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            {col.name}
          </h1>
        </div>
        <p className="pl-4 text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
          Regla: {FIELD_LABELS[col.rule_field] ?? col.rule_field} = &quot;{col.rule_value}&quot;
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Productos", value: matches.length, color: "var(--foreground)" },
          { label: "Stock total", value: totalStock, color: "var(--foreground)" },
          { label: "Sin stock", value: matches.filter(p => Number(p.stock) === 0).length, color: "var(--status-danger-fg)" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-3xl font-bold font-mono mb-1 tabular-nums" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de productos */}
      {matches.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--muted-foreground)" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Ningún producto cumple esta regla</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
                {["Foto", "Producto", "SKU", "Precio", "Stock", "Estado"].map((col, i) => (
                  <th key={col} scope="col" className={`px-4 py-4 text-xs font-mono font-semibold uppercase tracking-widest ${i === 5 ? "text-right" : "text-left"}`} style={{ color: "var(--muted-foreground)" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((p, i) => {
                const stock = Number(p.stock) || 0
                const threshold = Number(p.stock_min_threshold) || 5
                const statusBg = stock === 0 ? "var(--status-danger-bg)" : stock <= threshold ? "var(--status-warning-bg)" : "var(--status-success-bg)"
                const statusFg = stock === 0 ? "var(--status-danger-fg)" : stock <= threshold ? "var(--status-warning-fg)" : "var(--status-success-fg)"
                const statusLabel = stock === 0 ? "Sin stock" : stock <= threshold ? "Stock bajo" : "OK"
                return (
                  <tr key={String(p.id)} style={{ borderBottom: i < matches.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-4 py-3.5">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(p.image_url)} alt={String(p.model)} className="w-10 h-10 object-cover rounded-lg" style={{ border: "1px solid var(--border)" }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--muted-foreground)" }}>{String(p.brand)}</p>
                      <p className="font-medium" style={{ color: "var(--foreground)" }}>{String(p.model)}</p>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{String(p.sku)}</span></td>
                    <td className="px-4 py-3.5"><span className="font-mono font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>S/ {String(p.price)}</span></td>
                    <td className="px-4 py-3.5"><span className="text-xs font-mono font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{stock} uds</span></td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ color: statusFg, background: statusBg }}>{statusLabel}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
