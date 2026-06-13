"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const RULE_FIELDS = [
  { value: "dial_color",     label: "Color de esfera" },
  { value: "brand",          label: "Marca" },
  { value: "style",          label: "Estilo" },
  { value: "movement",       label: "Movimiento" },
  { value: "gender",         label: "Género" },
  { value: "condition",      label: "Condición" },
  { value: "strap_material", label: "Material correa" },
  { value: "case_material",  label: "Material caja" },
]

interface Collection {
  id: string
  name: string
  rule_field: string
  rule_value: string
  created_at: string
  product_count: number
  total_stock: number
  low_stock_count: number
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
  borderRadius: "0.625rem",
  padding: "0.55rem 0.875rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
}

export function CollectionsPanel({ initialCollections }: { initialCollections: Collection[] }) {
  const router = useRouter()
  const [collections, setCollections] = useState(initialCollections)
  const [name, setName] = useState("")
  const [ruleField, setRuleField] = useState("dial_color")
  const [ruleValue, setRuleValue] = useState("")
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !ruleValue) return
    setCreating(true)
    setError("")
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rule_field: ruleField, rule_value: ruleValue }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setError(data.error); return }
    setName(""); setRuleValue("")
    router.refresh()
    setCollections(prev => [...prev, { ...data.collection, product_count: 0, total_stock: 0, low_stock_count: 0 }])
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch(`/api/collections/${id}`, { method: "DELETE" })
    setDeleting(null)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Formulario crear */}
      <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #8b5cf6, #6366f1)" }} />
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#8b5cf6" }}>Nueva colección</h2>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Relojes Sport" style={inputStyle} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>Filtrar por</label>
            <select value={ruleField} onChange={e => setRuleField(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {RULE_FIELDS.map(f => <option key={f.value} value={f.value} style={{ background: "#0f172a" }}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>Valor</label>
            <input value={ruleValue} onChange={e => setRuleValue(e.target.value)} placeholder="Ej: Sport, Casio, Negro..." style={inputStyle} required />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)", boxShadow: "0 4px 15px rgba(139,92,246,0.3)" }}
          >
            {creating ? "Creando..." : "+ Crear"}
          </button>
        </form>
        {error && <p className="mt-3 text-xs" style={{ color: "#f87171" }}>{error}</p>}
      </div>

      {/* Lista de colecciones */}
      {collections.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--card)", borderColor: "rgba(139,92,246,0.1)" }}>
          <p className="text-sm font-medium text-slate-400">No hay colecciones creadas</p>
          <p className="text-xs mt-1" style={{ color: "#334155" }}>Crea la primera usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col.id} className="rounded-xl p-5 relative overflow-hidden group" style={{ background: "var(--card)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-200">{col.name}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: "#6366f1" }}>
                    {RULE_FIELDS.find(f => f.value === col.rule_field)?.label ?? col.rule_field} = {col.rule_value}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(col.id)}
                  disabled={deleting === col.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <p className="text-lg font-bold font-mono" style={{ color: "#818cf8" }}>{col.product_count}</p>
                  <p className="text-[10px]" style={{ color: "#334155" }}>productos</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <p className="text-lg font-bold font-mono" style={{ color: "#34d399" }}>{col.total_stock}</p>
                  <p className="text-[10px]" style={{ color: "#334155" }}>stock total</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: col.low_stock_count > 0 ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)", border: col.low_stock_count > 0 ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-lg font-bold font-mono" style={{ color: col.low_stock_count > 0 ? "#f87171" : "#475569" }}>{col.low_stock_count}</p>
                  <p className="text-[10px]" style={{ color: "#334155" }}>stock bajo</p>
                </div>
              </div>

              <Link
                href={`/admin/collections/${col.id}`}
                className="block w-full text-center py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}
              >
                Ver productos →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
