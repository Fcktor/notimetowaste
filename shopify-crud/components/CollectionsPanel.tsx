"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  background: "#FFFFFF",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
  borderRadius: "0.375rem",
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
  const [confirmTarget, setConfirmTarget] = useState<Collection | null>(null)
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
    setConfirmTarget(null)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Formulario crear */}
      <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--primary)" }} />
          <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--foreground)" }}>Nueva colección</h2>
        </div>

        <form onSubmit={handleCreate} className="grid grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>Nombre</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Relojes Sport" style={inputStyle} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>Filtrar por</label>
            <select value={ruleField} onChange={e => setRuleField(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {RULE_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)" }}>Valor</label>
            <input value={ruleValue} onChange={e => setRuleValue(e.target.value)} placeholder="Ej: Sport, Casio, Negro..." style={inputStyle} required />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="btn-cyber py-2.5 px-4 rounded-md text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {creating ? "Creando..." : "+ Crear"}
          </button>
        </form>
        {error && <p className="mt-3 text-xs" style={{ color: "var(--status-danger-fg)" }}>{error}</p>}
      </div>

      {/* Lista de colecciones */}
      {collections.length === 0 ? (
        <div className="rounded-xl border p-16 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No hay colecciones creadas</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Crea la primera usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col.id} className="rounded-xl p-5 relative overflow-hidden group" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>{col.name}</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--muted-foreground)" }}>
                    {RULE_FIELDS.find(f => f.value === col.rule_field)?.label ?? col.rule_field} = {col.rule_value}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmTarget(col)}
                  disabled={deleting === col.id}
                  aria-label={`Eliminar colección ${col.name}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--status-danger-bg)", color: "var(--status-danger-fg)" }}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  <p className="text-lg font-bold font-mono tabular-nums" style={{ color: "var(--foreground)" }}>{col.product_count}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>productos</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: "var(--status-success-bg)", border: "1px solid var(--border)" }}>
                  <p className="text-lg font-bold font-mono tabular-nums" style={{ color: "var(--status-success-fg)" }}>{col.total_stock}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>stock total</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: col.low_stock_count > 0 ? "var(--status-danger-bg)" : "var(--muted)", border: "1px solid var(--border)" }}>
                  <p className="text-lg font-bold font-mono tabular-nums" style={{ color: col.low_stock_count > 0 ? "var(--status-danger-fg)" : "var(--muted-foreground)" }}>{col.low_stock_count}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>stock bajo</p>
                </div>
              </div>

              <Link
                href={`/admin/collections/${col.id}`}
                className="block w-full text-center py-2 rounded-md text-xs font-semibold transition-all"
                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                Ver productos →
              </Link>
            </div>
          ))}
        </div>
      )}

      <Dialog open={confirmTarget != null} onOpenChange={(open) => { if (!open) setConfirmTarget(null) }}>
        <DialogContent
          className="sm:max-w-md"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--foreground)" }}>
              Eliminar colección: <span style={{ color: "var(--foreground)" }}>{confirmTarget?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Esta acción no se puede deshacer. Los productos que cumplen esta regla no se eliminan, solo dejan de agruparse en esta colección.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmTarget(null)}
              disabled={deleting != null}
              className="transition-colors"
              style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => confirmTarget && handleDelete(confirmTarget.id)}
              disabled={deleting != null}
              style={{ background: "var(--status-danger-bg)", border: "1px solid var(--status-danger-fg)", color: "var(--status-danger-fg)" }}
            >
              {deleting != null ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
