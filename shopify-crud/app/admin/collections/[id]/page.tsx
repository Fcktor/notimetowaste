import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getCollections, FIELD_LABELS } from "@/lib/collectionsStore"
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
  const matches = products.filter(
    p => String(p[col.rule_field] ?? "").toLowerCase() === col.rule_value.toLowerCase()
  )
  const totalStock = matches.reduce((s, p) => s + (Number(p.stock) || 0), 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/collections" className="text-xs font-mono mb-4 inline-flex items-center gap-1.5 transition-colors" style={{ color: "#475569" }}>
          ← Colecciones
        </Link>
        <div className="flex items-center gap-3 mt-2 mb-1">
          <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #8b5cf6, #6366f1)" }} />
          <h1 className="text-2xl font-bold tracking-tight" style={{ background: "linear-gradient(90deg, #c4b5fd, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {col.name}
          </h1>
        </div>
        <p className="pl-4 text-xs font-mono" style={{ color: "#6366f1" }}>
          Regla: {FIELD_LABELS[col.rule_field] ?? col.rule_field} = &quot;{col.rule_value}&quot;
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Productos", value: matches.length, color: "#818cf8" },
          { label: "Stock total", value: totalStock, color: "#34d399" },
          { label: "Sin stock", value: matches.filter(p => Number(p.stock) === 0).length, color: "#f87171" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5 text-center" style={{ background: "var(--card)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p className="text-3xl font-bold font-mono mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs uppercase tracking-widest" style={{ color: "#334155" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de productos */}
      {matches.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--card)", borderColor: "rgba(139,92,246,0.1)" }}>
          <p className="text-sm text-slate-400">Ningún producto cumple esta regla</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(139,92,246,0.1)", background: "rgba(139,92,246,0.04)" }}>
                {["Foto", "Producto", "SKU", "Precio", "Stock", "Estado"].map((col, i) => (
                  <th key={col} className={`px-4 py-4 text-xs font-mono font-semibold uppercase tracking-widest ${i === 5 ? "text-right" : "text-left"}`} style={{ color: "#4c1d95" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((p, i) => {
                const stock = Number(p.stock) || 0
                const threshold = Number(p.stock_min_threshold) || 5
                const statusColor = stock === 0 ? "#f87171" : stock <= threshold ? "#fbbf24" : "#34d399"
                const statusLabel = stock === 0 ? "Sin stock" : stock <= threshold ? "Stock bajo" : "OK"
                return (
                  <tr key={String(p.id)} style={{ borderBottom: i < matches.length - 1 ? "1px solid rgba(255,255,255,0.035)" : "none" }}>
                    <td className="px-4 py-3.5">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(p.image_url)} alt={String(p.model)} className="w-10 h-10 object-cover rounded-lg" style={{ border: "1px solid rgba(139,92,246,0.2)" }} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#8b5cf6" }}>{String(p.brand)}</p>
                      <p className="font-medium text-slate-200">{String(p.model)}</p>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs font-mono" style={{ color: "#334155" }}>{String(p.sku)}</span></td>
                    <td className="px-4 py-3.5"><span className="font-mono font-semibold" style={{ color: "#22d3ee" }}>S/ {String(p.price)}</span></td>
                    <td className="px-4 py-3.5"><span className="text-xs font-mono font-semibold">{stock} uds</span></td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ color: statusColor, background: `${statusColor}14`, border: `1px solid ${statusColor}33` }}>{statusLabel}</span>
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
