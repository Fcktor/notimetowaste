"use client"
import { useState, useMemo } from "react"
import { ProductCard } from "./ProductCard"

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

interface ActiveFilters {
  brands: string[]
  styles: string[]
  movements: string[]
  genders: string[]
  conditions: string[]
  priceMin: string
  priceMax: string
}

const EMPTY: ActiveFilters = {
  brands: [], styles: [], movements: [], genders: [], conditions: [],
  priceMin: "", priceMax: "",
}

function unique(arr: (string | null | undefined)[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const v of arr) {
    if (!v) continue
    const trimmed = v.trim()
    const key = trimmed.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(trimmed)
    }
  }
  return result.sort()
}

function matches(productVal: string | null | undefined, selected: string[]): boolean {
  if (!productVal) return false
  return selected.some(s => s.toLowerCase() === productVal.trim().toLowerCase())
}

const SORT_OPTIONS = [
  { label: "Predeterminado", value: "default" },
  { label: "Precio: menor a mayor", value: "price-asc" },
  { label: "Precio: mayor a menor", value: "price-desc" },
  { label: "Nombre: A-Z", value: "name-asc" },
  { label: "Nombre: Z-A", value: "name-desc" },
]

function FilterGroup({ label, options, selected, onToggle }: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(true)
  if (options.length === 0) return null
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-left"
        style={{ color: "rgba(226,232,240,0.9)" }}
      >
        {label}
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", opacity: 0.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-3 space-y-2">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="w-4 h-4 rounded cursor-pointer accent-blue-400"
              />
              <span className="text-sm transition-colors group-hover:text-blue-300"
                style={{ color: "rgba(148,163,184,0.85)" }}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function StorefrontFilters({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY)
  const [sort, setSort] = useState("default")
  const [cols, setCols] = useState<4 | 2>(4)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const opts = useMemo(() => ({
    brands: unique(products.map(p => p.brand)),
    styles: unique(products.map(p => p.style)),
    movements: unique(products.map(p => p.movement)),
    genders: unique(products.map(p => p.gender)),
    conditions: unique(products.map(p => p.condition)),
    maxPrice: Math.max(...products.map(p => p.price), 0),
  }), [products])

  function toggle(field: keyof Omit<ActiveFilters, "priceMin" | "priceMax">, val: string) {
    setFilters(prev => {
      const arr = prev[field] as string[]
      return { ...prev, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
    })
  }

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      if (filters.brands.length && !matches(p.brand, filters.brands)) return false
      if (filters.styles.length && !matches(p.style, filters.styles)) return false
      if (filters.movements.length && !matches(p.movement, filters.movements)) return false
      if (filters.genders.length && !matches(p.gender, filters.genders)) return false
      if (filters.conditions.length && !matches(p.condition, filters.conditions)) return false
      if (filters.priceMin !== "" && p.price < Number(filters.priceMin)) return false
      if (filters.priceMax !== "" && p.price > Number(filters.priceMax)) return false
      return true
    })
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price)
    else if (sort === "name-asc") list = [...list].sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))
    else if (sort === "name-desc") list = [...list].sort((a, b) => `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`))
    return list
  }, [products, filters, sort])

  const chips = useMemo(() => {
    const c: { label: string; remove: () => void }[] = []
    filters.brands.forEach(v => c.push({ label: v, remove: () => toggle("brands", v) }))
    filters.styles.forEach(v => c.push({ label: v, remove: () => toggle("styles", v) }))
    filters.movements.forEach(v => c.push({ label: v, remove: () => toggle("movements", v) }))
    filters.genders.forEach(v => c.push({ label: v, remove: () => toggle("genders", v) }))
    filters.conditions.forEach(v => c.push({ label: v, remove: () => toggle("conditions", v) }))
    if (filters.priceMin) c.push({ label: `Desde S/ ${filters.priceMin}`, remove: () => setFilters(f => ({ ...f, priceMin: "" })) })
    if (filters.priceMax) c.push({ label: `Hasta S/ ${filters.priceMax}`, remove: () => setFilters(f => ({ ...f, priceMax: "" })) })
    return c
  }, [filters])

  const sidebar = (
    <div>
      <FilterGroup label="Marca" options={opts.brands} selected={filters.brands} onToggle={v => toggle("brands", v)} />
      <FilterGroup label="Estilo" options={opts.styles} selected={filters.styles} onToggle={v => toggle("styles", v)} />
      <FilterGroup label="Movimiento" options={opts.movements} selected={filters.movements} onToggle={v => toggle("movements", v)} />
      <FilterGroup label="Género" options={opts.genders} selected={filters.genders} onToggle={v => toggle("genders", v)} />
      <FilterGroup label="Condición" options={opts.conditions} selected={filters.conditions} onToggle={v => toggle("conditions", v)} />

      {/* Precio */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="py-3 text-sm font-semibold" style={{ color: "rgba(226,232,240,0.9)" }}>Precio</p>
        <div className="flex items-center gap-2 pb-3">
          <div className="flex items-center gap-1 flex-1 rounded-lg px-2 py-1.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>S/</span>
            <input type="text" inputMode="decimal" placeholder="0"
              value={filters.priceMin}
              onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
              className="w-full text-sm outline-none bg-transparent"
              style={{ color: "#e2e8f0" }} />
          </div>
          <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>a</span>
          <div className="flex items-center gap-1 flex-1 rounded-lg px-2 py-1.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>S/</span>
            <input type="text" inputMode="decimal" placeholder={String(opts.maxPrice)}
              value={filters.priceMax}
              onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
              className="w-full text-sm outline-none bg-transparent"
              style={{ color: "#e2e8f0" }} />
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <button onClick={() => setFilters(EMPTY)}
          className="w-full text-xs py-3 text-center transition-colors hover:text-red-400"
          style={{ color: "rgba(148,163,184,0.5)" }}>
          Borrar todos los filtros
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Mobile filter button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Filtros
          {chips.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: "#3b82f6", color: "white" }}>
              {chips.length}
            </span>
          )}
        </button>

        <span className="text-xs font-mono hidden lg:block"
          style={{ color: "rgba(191,219,254,0.7)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 12px", borderRadius: 8 }}>
          {filtered.length} items
        </span>

        <div className="flex items-center gap-3 ml-auto">
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: "#0f172a" }}>{o.label}</option>
            ))}
          </select>

          {/* Grid switcher */}
          <div className="hidden sm:flex items-center rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}>
            {([4, 2] as const).map(n => (
              <button key={n} onClick={() => setCols(n)}
                className="flex items-center justify-center w-9 h-9 transition-colors"
                style={{
                  background: cols === n ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                  color: cols === n ? "#60a5fa" : "rgba(148,163,184,0.5)",
                }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  {n === 4
                    ? <><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></>
                    : <><rect x="1" y="1" width="6" height="14" rx="1"/><rect x="9" y="1" width="6" height="14" rx="1"/></>
                  }
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((chip, i) => (
            <button key={i} onClick={chip.remove}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.3)" }}>
              {chip.label}
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button onClick={() => setFilters(EMPTY)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:text-red-400"
            style={{ color: "rgba(148,163,184,0.5)" }}>
            Borrar todo
          </button>
        </div>
      )}

      {/* Layout */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="rounded-2xl p-4 sticky top-20"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {sidebar}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono mb-4 lg:hidden"
            style={{ color: "rgba(191,219,254,0.7)" }}>
            {filtered.length} items
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-sm mb-3" style={{ color: "rgba(148,163,184,0.6)" }}>
                Ningún reloj coincide con los filtros seleccionados.
              </p>
              <button onClick={() => setFilters(EMPTY)} className="text-sm font-semibold" style={{ color: "#60a5fa" }}>
                Borrar filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-80 h-full flex flex-col shadow-2xl"
            style={{ background: "#0a1628" }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span className="font-semibold text-sm text-white">Filtros</span>
              <button onClick={() => setDrawerOpen(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(148,163,184,0.7)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{sidebar}</div>
            <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                Ver {filtered.length} {filtered.length === 1 ? "reloj" : "relojes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
