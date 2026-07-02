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
  Nuevo:   { background: "var(--status-success-bg)", color: "var(--status-success-fg)" },
  Vintage: { background: "var(--status-warning-bg)", color: "var(--status-warning-fg)" },
};

const STYLE_STYLE: Record<string, React.CSSProperties> = {
  Sport:  { background: "var(--muted)", color: "var(--foreground)" },
  Dress:  { background: "var(--status-info-bg)", color: "var(--status-info-fg)" },
  Casual: { background: "var(--muted)", color: "var(--muted-foreground)" },
};

export function ProductTable({ products }: { products: Watch[] }) {
  if (!products.length) {
    return (
      <div
        className="relative rounded-xl border p-16 text-center overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--muted-foreground)" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>No hay relojes cargados</p>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Creá el primer reloj con el botón de arriba</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)" }}>
            {["Foto", "Marca / Modelo", "SKU", "Precio", "Stock", "Condición", "Estilo", "Acciones"].map((col, i) => (
              <th
                key={col}
                className={`px-4 py-4 text-xs font-mono font-semibold uppercase tracking-[0.12em] ${i === 7 ? "text-right" : "text-left"}`}
                style={{ color: "var(--muted-foreground)" }}
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
              style={{ borderBottom: i < products.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              {/* Foto */}
              <td className="px-4 py-3.5">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.model} className="w-10 h-10 object-cover rounded-lg" style={{ border: "1px solid var(--border)" }} />
                ) : (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--muted-foreground)" strokeWidth={1.5}>
                      <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                )}
              </td>

              {/* Marca / Modelo */}
              <td className="px-4 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--muted-foreground)" }}>{p.brand}</p>
                <p className="font-medium transition-colors" style={{ color: "var(--foreground)" }}>{p.model}</p>
              </td>

              {/* SKU */}
              <td className="px-4 py-3.5">
                <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{p.sku}</span>
              </td>

              {/* Precio */}
              <td className="px-4 py-3.5">
                <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>S/ {p.price}</span>
              </td>

              {/* Stock */}
              <td className="px-4 py-3.5">
                <span
                  className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-md tabular-nums"
                  style={
                    p.stock === 0
                      ? { background: "var(--status-danger-bg)", color: "var(--status-danger-fg)" }
                      : p.stock <= (p.stock_min_threshold ?? 5)
                      ? { background: "var(--status-warning-bg)", color: "var(--status-warning-fg)" }
                      : { background: "var(--status-success-bg)", color: "var(--status-success-fg)" }
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
                    style={{ color: "var(--foreground)", background: "var(--muted)", border: "1px solid var(--border)" }}
                    title="Editar"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
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
    </div>
  );
}
