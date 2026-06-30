"use client";
import Link from "next/link";
import { DeleteModal } from "./DeleteModal";

interface Watch {
  id: string;
  sku: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  stock_min_threshold: number;
  condition: string;
  style: string;
  image_url: string | null;
  available: boolean;
}

function EditIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

const CONDITION_STYLE: Record<string, React.CSSProperties> = {
  Nuevo:   { background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" },
  Vintage: { background: "rgba(245,158,11,0.08)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" },
};

const STYLE_STYLE: Record<string, React.CSSProperties> = {
  Sport:  { background: "rgba(196,163,90,0.08)", color: "#C4A35A", border: "1px solid rgba(196,163,90,0.2)" },
  Dress:  { background: "rgba(168,85,247,0.08)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.2)" },
  Casual: { background: "rgba(100,116,139,0.08)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.2)" },
};

export function ProductTable({ products }: { products: Watch[] }) {
  if (!products.length) {
    return (
      <div
        className="relative rounded-xl border p-16 text-center overflow-hidden"
        style={{ background: "var(--card)", borderColor: "rgba(196,163,90,0.15)" }}
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(196,163,90,0.08)", border: "1px solid rgba(196,163,90,0.25)" }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#C4A35A" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-400">No hay relojes cargados</p>
        <p className="text-xs mt-1" style={{ color: "#7A6E64" }}>Creá el primer reloj con el botón de arriba</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(196,163,90,0.15)", boxShadow: "0 0 40px rgba(196,163,90,0.06)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,163,90,0.4), rgba(196,163,90,0.35), transparent)" }} />

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(196,163,90,0.1)", background: "rgba(196,163,90,0.04)" }}>
            {["Foto", "Marca / Modelo", "SKU", "Precio", "Stock", "Condición", "Estilo", "Acciones"].map((col, i) => (
              <th
                key={col}
                className={`px-4 py-4 text-xs font-mono font-semibold uppercase tracking-[0.12em] ${i === 7 ? "text-right" : "text-left"}`}
                style={{ color: "rgba(196,163,90,0.5)" }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              className="table-row-hover transition-all duration-200 group"
              style={{ borderBottom: i < products.length - 1 ? "1px solid rgba(255,255,255,0.035)" : "none" }}
            >
              {/* Foto */}
              <td className="px-4 py-3.5">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.model} className="w-10 h-10 object-cover rounded-lg" style={{ border: "1px solid rgba(196,163,90,0.2)" }} />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(196,163,90,0.06)", border: "1px solid rgba(196,163,90,0.15)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C4A35A" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                )}
              </td>

              {/* Marca / Modelo */}
              <td className="px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#C4A35A" }}>{p.brand}</p>
                <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{p.model}</p>
              </td>

              {/* SKU */}
              <td className="px-4 py-3.5">
                <span className="text-xs font-mono" style={{ color: "#7A6E64" }}>{p.sku}</span>
              </td>

              {/* Precio */}
              <td className="px-4 py-3.5">
                <span className="font-mono text-sm font-semibold" style={{ color: "#C4A35A" }}>S/ {p.price}</span>
              </td>

              {/* Stock */}
              <td className="px-4 py-3.5">
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-md"
                  style={
                    p.stock === 0
                      ? { background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                      : p.stock <= (p.stock_min_threshold ?? 5)
                      ? { background: "rgba(245,158,11,0.08)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }
                      : { background: "rgba(196,163,90,0.08)", color: "#C4A35A", border: "1px solid rgba(196,163,90,0.2)" }
                  }
                >
                  {p.stock} uds
                </span>
              </td>

              {/* Condición */}
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md" style={CONDITION_STYLE[p.condition] ?? {}}>
                  {p.condition}
                </span>
              </td>

              {/* Estilo */}
              <td className="px-4 py-3.5">
                <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md" style={STYLE_STYLE[p.style] ?? {}}>
                  {p.style}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/admin/products/${encodeURIComponent(p.id)}`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
                    style={{ color: "#C4A35A", background: "rgba(196,163,90,0.08)", border: "1px solid rgba(196,163,90,0.2)" }}
                    title="Editar"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 12px rgba(196,163,90,0.4)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
                  >
                    <EditIcon />
                  </Link>
                  <DeleteModal productId={p.id} productTitle={`${p.brand} ${p.model}`} quantity={p.stock} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(196,163,90,0.2), transparent)" }} />
    </div>
  );
}
