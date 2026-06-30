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
    if (!seen.has(key)) { seen.add(key); result.push(trimmed) }
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
  { label: "Nombre A–Z", value: "name-asc" },
  { label: "Nombre Z–A", value: "name-desc" },
]

const LABEL_STYLE = {
  color: "rgba(237,232,223,0.45)",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "9px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
}

function FilterGroup({ label, options, selected, onToggle }: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  const [open, setOpen] = useState(true)
  if (options.length === 0) return null
  return (
    <div style={{ borderBottom: "1px solid rgba(196,163,90,0.08)", paddingBottom: open ? "0.75rem" : 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-left"
        style={LABEL_STYLE}
      >
        {label}
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", opacity: 0.4, flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="space-y-2.5">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  border: `1px solid ${selected.includes(opt) ? "rgba(196,163,90,0.8)" : "rgba(196,163,90,0.2)"}`,
                  background: selected.includes(opt) ? "rgba(196,163,90,0.15)" : "transparent",
                  borderRadius: "2px",
                }}
                onClick={() => onToggle(opt)}
              >
                {selected.includes(opt) && (
                  <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className="text-xs transition-colors duration-150"
                style={{ color: selected.includes(opt) ? "#EDE8DF" : "rgba(122,110,100,0.8)" }}
                onClick={() => onToggle(opt)}
              >
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
  const [cols, setCols] = useState<3 | 2>(3)
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
    list = [...list].sort((a, b) => Number(b.available) - Number(a.available))
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
    <div className="space-y-0">
      <FilterGroup label="Marca" options={opts.brands} selected={filters.brands} onToggle={v => toggle("brands", v)} />
      <FilterGroup label="Estilo" options={opts.styles} selected={filters.styles} onToggle={v => toggle("styles", v)} />
      <FilterGroup label="Movimiento" options={opts.movements} selected={filters.movements} onToggle={v => toggle("movements", v)} />
      <FilterGroup label="Género" options={opts.genders} selected={filters.genders} onToggle={v => toggle("genders", v)} />
      <FilterGroup label="Condición" options={opts.conditions} selected={filters.conditions} onToggle={v => toggle("conditions", v)} />

      <div style={{ borderBottom: "1px solid rgba(196,163,90,0.08)" }}>
        <p className="py-3" style={LABEL_STYLE}>Precio</p>
        <div className="flex items-center gap-2 pb-3">
          {(["priceMin", "priceMax"] as const).map((field, i) => (
            <div key={field} className="flex items-center gap-1 flex-1 px-2 py-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(196,163,90,0.14)", borderRadius: "0.25rem" }}>
              <span className="text-[10px]" style={{ color: "rgba(196,163,90,0.35)" }}>S/</span>
              <input
                type="text" inputMode="decimal"
                placeholder={i === 0 ? "0" : String(opts.maxPrice)}
                value={filters[field]}
                onChange={e => setFilters(f => ({ ...f, [field]: e.target.value }))}
                className="w-full text-xs outline-none bg-transparent"
                style={{ color: "#EDE8DF" }}
              />
            </div>
          ))}
        </div>
      </div>

      {chips.length > 0 && (
        <button
          onClick={() => setFilters(EMPTY)}
          className="w-full text-center pt-4 pb-1 transition-colors duration-150"
          style={{ ...LABEL_STYLE, color: "rgba(196,163,90,0.4)" }}
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 flex-wrap"
        style={{ borderBottom: "1px solid rgba(196,163,90,0.08)" }}>

        {/* Mobile filter button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex lg:hidden items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.14em] relative"
          style={{ color: "rgba(237,232,223,0.55)", border: "1px solid rgba(196,163,90,0.2)", borderRadius: "0.25rem" }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Filtros
          {chips.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-semibold flex items-center justify-center"
              style={{ background: "#C4A35A", color: "#0C0B09" }}>
              {chips.length}
            </span>
          )}
        </button>

        <span className="hidden lg:block text-xs" style={{ color: "rgba(122,110,100,0.55)", letterSpacing: "0.1em" }}>
          {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
        </span>

        <div className="flex items-center gap-3 ml-auto">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs outline-none cursor-pointer px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(196,163,90,0.18)",
              color: "rgba(237,232,223,0.6)",
              borderRadius: "0.25rem",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "0.05em",
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: "#1C1916" }}>{o.label}</option>
            ))}
          </select>

          {/* Grid toggle */}
          <div className="hidden sm:flex items-center" style={{ border: "1px solid rgba(196,163,90,0.18)", borderRadius: "0.25rem", overflow: "hidden" }}>
            {([3, 2] as const).map(n => (
              <button key={n} onClick={() => setCols(n)}
                className="flex items-center justify-center w-8 h-8 transition-colors duration-150"
                style={{
                  background: cols === n ? "rgba(196,163,90,0.12)" : "transparent",
                  color: cols === n ? "#C4A35A" : "rgba(122,110,100,0.5)",
                }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  {n === 3
                    ? <><rect x="1" y="1" width="3.5" height="6" rx="0.5"/><rect x="6.25" y="1" width="3.5" height="6" rx="0.5"/><rect x="11.5" y="1" width="3.5" height="6" rx="0.5"/><rect x="1" y="9" width="3.5" height="6" rx="0.5"/><rect x="6.25" y="9" width="3.5" height="6" rx="0.5"/><rect x="11.5" y="9" width="3.5" height="6" rx="0.5"/></>
                    : <><rect x="1" y="1" width="6" height="14" rx="0.5"/><rect x="9" y="1" width="6" height="14" rx="0.5"/></>
                  }
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((chip, i) => (
            <button key={i} onClick={chip.remove}
              className="flex items-center gap-1.5 px-3 py-1 text-xs transition-all duration-150"
              style={{
                color: "#C4A35A",
                background: "rgba(196,163,90,0.08)",
                border: "1px solid rgba(196,163,90,0.25)",
                borderRadius: "2px",
                letterSpacing: "0.05em",
              }}
            >
              {chip.label}
              <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* ── Layout: sidebar + grid ── */}
      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-44 flex-shrink-0">
          <div className="sticky top-24">
            <p className="mb-5" style={LABEL_STYLE}>Filtrar</p>
            {sidebar}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <p className="text-xs mb-5 lg:hidden" style={{ color: "rgba(122,110,100,0.55)", letterSpacing: "0.1em" }}>
            {filtered.length} {filtered.length === 1 ? "pieza" : "piezas"}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-sm mb-4" style={{ color: "#7A6E64" }}>
                Ningún reloj coincide con los filtros seleccionados.
              </p>
              <button
                onClick={() => setFilters(EMPTY)}
                className="text-xs uppercase tracking-[0.14em] transition-colors duration-150"
                style={{ color: "rgba(196,163,90,0.6)" }}
              >
                Limpiar filtros
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

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-72 h-full flex flex-col"
            style={{ background: "#0F0E0C", borderLeft: "1px solid rgba(196,163,90,0.12)" }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(196,163,90,0.1)" }}>
              <span style={{ ...LABEL_STYLE, color: "rgba(196,163,90,0.7)" }}>Filtrar colección</span>
              <button onClick={() => setDrawerOpen(false)} style={{ color: "rgba(122,110,100,0.6)" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{sidebar}</div>
            <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(196,163,90,0.1)" }}>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 text-xs uppercase tracking-[0.14em] transition-all duration-150"
                style={{ background: "#C4A35A", color: "#0C0B09", borderRadius: "0.25rem" }}
              >
                Ver {filtered.length} {filtered.length === 1 ? "reloj" : "relojes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
