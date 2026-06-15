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

const EMPTY_FILTERS: ActiveFilters = {
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

function FilterSection({ label, options, selected, onChange }: {
  label: string
  options: string[]
  selected: string[]
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(true)
  if (options.length === 0) return null
  return (
    <div style={{ borderBottom: "1px solid #e2e8f0" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-left"
        style={{ color: "#0f172a" }}
      >
        {label}
        <svg
          width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
        >
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
                onChange={() => onChange(opt)}
                className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
              />
              <span className="text-sm group-hover:text-blue-600 transition-colors" style={{ color: "#334155" }}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

const SORT_OPTIONS = [
  { label: "Predeterminado", value: "default" },
  { label: "Precio: menor a mayor", value: "price-asc" },
  { label: "Precio: mayor a menor", value: "price-desc" },
  { label: "Nombre: A-Z", value: "name-asc" },
  { label: "Nombre: Z-A", value: "name-desc" },
]

export function CollectionFilters({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS)
  const [sort, setSort] = useState("default")
  const [cols, setCols] = useState<4 | 2>(4)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const options = useMemo(() => ({
    brands: unique(products.map(p => p.brand)),
    styles: unique(products.map(p => p.style)),
    movements: unique(products.map(p => p.movement)),
    genders: unique(products.map(p => p.gender)),
    conditions: unique(products.map(p => p.condition)),
    priceMax: Math.max(...products.map(p => p.price), 0),
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

  const activeChips = useMemo(() => {
    const chips: { label: string; remove: () => void }[] = []
    filters.brands.forEach(v => chips.push({ label: v, remove: () => toggle("brands", v) }))
    filters.styles.forEach(v => chips.push({ label: v, remove: () => toggle("styles", v) }))
    filters.movements.forEach(v => chips.push({ label: v, remove: () => toggle("movements", v) }))
    filters.genders.forEach(v => chips.push({ label: v, remove: () => toggle("genders", v) }))
    filters.conditions.forEach(v => chips.push({ label: v, remove: () => toggle("conditions", v) }))
    if (filters.priceMin) chips.push({ label: `Desde S/ ${filters.priceMin}`, remove: () => setFilters(f => ({ ...f, priceMin: "" })) })
    if (filters.priceMax) chips.push({ label: `Hasta S/ ${filters.priceMax}`, remove: () => setFilters(f => ({ ...f, priceMax: "" })) })
    return chips
  }, [filters])

  const totalActive = activeChips.length

  const sidebar = (
    <div className="space-y-0">
      <FilterSection label="Marca" options={options.brands} selected={filters.brands} onChange={v => toggle("brands", v)} />
      <FilterSection label="Estilo" options={options.styles} selected={filters.styles} onChange={v => toggle("styles", v)} />
      <FilterSection label="Movimiento" options={options.movements} selected={filters.movements} onChange={v => toggle("movements", v)} />
      <FilterSection label="Género" options={options.genders} selected={filters.genders} onChange={v => toggle("genders", v)} />
      <FilterSection label="Condición" options={options.conditions} selected={filters.conditions} onChange={v => toggle("conditions", v)} />

      {/* Precio */}
      <div style={{ borderBottom: "1px solid #e2e8f0" }}>
        <p className="py-3 text-sm font-semibold" style={{ color: "#0f172a" }}>Precio</p>
        <div className="flex items-center gap-2 pb-3">
          <div className="flex items-center gap-1 flex-1 rounded-lg px-2 py-1.5" style={{ border: "1px solid #e2e8f0" }}>
            <span className="text-xs" style={{ color: "#94a3b8" }}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={filters.priceMin}
              onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
              className="w-full text-sm outline-none bg-transparent"
              style={{ color: "#0f172a" }}
            />
          </div>
          <span className="text-xs" style={{ color: "#94a3b8" }}>a</span>
          <div className="flex items-center gap-1 flex-1 rounded-lg px-2 py-1.5" style={{ border: "1px solid #e2e8f0" }}>
            <span className="text-xs" style={{ color: "#94a3b8" }}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={String(options.priceMax)}
              value={filters.priceMax}
              onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
              className="w-full text-sm outline-none bg-transparent"
              style={{ color: "#0f172a" }}
            />
          </div>
        </div>
      </div>

      {totalActive > 0 && (
        <button
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="w-full text-xs font-semibold py-3 text-center transition-colors hover:text-red-600"
          style={{ color: "#94a3b8" }}
        >
          Borrar todos los filtros
        </button>
      )}
    </div>
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Mobile filter button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative"
          style={{ background: "white", border: "1px solid #e2e8f0", color: "#334155" }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Filtros
          {totalActive > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: "#3b82f6", color: "white" }}>
              {totalActive}
            </span>
          )}
        </button>

        <span className="text-sm hidden lg:block" style={{ color: "#64748b" }}>
          {filtered.length} {filtered.length === 1 ? "reloj" : "relojes"}
        </span>

        <div className="flex items-center gap-3 ml-auto">
          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
            style={{ background: "white", border: "1px solid #e2e8f0", color: "#334155" }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Grid switcher */}
          <div className="hidden sm:flex items-center rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
            {([4, 2] as const).map(n => (
              <button
                key={n}
                onClick={() => setCols(n)}
                className="flex items-center justify-center w-9 h-9 transition-colors"
                style={{
                  background: cols === n ? "#eff6ff" : "white",
                  color: cols === n ? "#1d4ed8" : "#94a3b8",
                }}
              >
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
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.remove}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all hover:bg-blue-50"
              style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
            >
              {chip.label}
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:text-red-600"
            style={{ color: "#94a3b8" }}
          >
            Borrar todo
          </button>
        </div>
      )}

      {/* Layout */}
      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          {sidebar}
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <p className="text-sm mb-4 lg:hidden" style={{ color: "#64748b" }}>
            {filtered.length} {filtered.length === 1 ? "reloj" : "relojes"}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-16 text-center" style={{ background: "white", border: "1px solid #e2e8f0" }}>
              <p className="text-sm mb-3" style={{ color: "#94a3b8" }}>Ningún reloj coincide con los filtros seleccionados.</p>
              <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm font-semibold" style={{ color: "#1d4ed8" }}>
                Borrar filtros
              </button>
            </div>
          ) : (
            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative ml-auto w-80 h-full bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #e2e8f0" }}>
              <span className="font-semibold text-sm" style={{ color: "#0f172a" }}>Filtros</span>
              <button onClick={() => setSidebarOpen(false)}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{sidebar}</div>
            <div className="px-5 py-4" style={{ borderTop: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
              >
                Ver {filtered.length} {filtered.length === 1 ? "reloj" : "relojes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
