"use client";
import { useState } from "react";

interface Watch {
  id: string;
  sku: string;
  brand: string;
  model: string;
  stock: number;
  stock_min_threshold: number;
  image_url: string | null;
}

function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0)
    return (
      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
        Sin stock
      </span>
    );
  if (stock <= threshold)
    return (
      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
        Stock bajo
      </span>
    );
  return (
    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
      OK
    </span>
  );
}

function InventoryRow({ product }: { product: Watch }) {
  const [stock, setStock] = useState(product.stock);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const threshold = product.stock_min_threshold ?? 5;

  async function save(newStock: number) {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/inventory/${encodeURIComponent(product.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function adjust(delta: number) {
    const next = Math.max(0, stock + delta);
    setStock(next);
  }

  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.035)" }}>
      {/* Foto */}
      <td className="px-4 py-3.5">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.model} className="w-10 h-10 object-cover rounded-lg" style={{ border: "1px solid rgba(245,158,11,0.2)" }} />
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
            </svg>
          </div>
        )}
      </td>

      {/* Producto */}
      <td className="px-4 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#f59e0b" }}>{product.brand}</p>
        <p className="font-medium text-slate-200">{product.model}</p>
      </td>

      {/* SKU */}
      <td className="px-4 py-3.5">
        <span className="text-xs font-mono" style={{ color: "#334155" }}>{product.sku}</span>
      </td>

      {/* Control de stock */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjust(-1)}
            disabled={stock === 0}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            −
          </button>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-16 text-center text-sm font-mono font-semibold rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "0.25rem 0.5rem" }}
          />
          <button
            onClick={() => adjust(1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}
          >
            +
          </button>
        </div>
      </td>

      {/* Mínimo */}
      <td className="px-4 py-3.5">
        <span className="text-xs font-mono" style={{ color: "#475569" }}>{threshold} uds</span>
      </td>

      {/* Estado */}
      <td className="px-4 py-3.5">
        <StockBadge stock={stock} threshold={threshold} />
      </td>

      {/* Guardar */}
      <td className="px-4 py-3.5 text-right">
        <button
          onClick={() => save(stock)}
          disabled={saving || stock === product.stock}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: saved ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.1)",
            border: saved ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,158,11,0.25)",
            color: saved ? "#34d399" : "#fbbf24",
          }}
        >
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar"}
        </button>
      </td>
    </tr>
  );
}

export function InventoryTable({ products }: { products: Watch[] }) {
  if (!products.length) {
    return (
      <div
        className="rounded-xl border p-16 text-center"
        style={{ background: "var(--card)", borderColor: "rgba(245,158,11,0.15)" }}
      >
        <p className="text-sm font-medium text-slate-400">No hay productos en inventario</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(245,158,11,0.15)", boxShadow: "0 0 40px rgba(245,158,11,0.04)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), rgba(239,68,68,0.3), transparent)" }} />

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(245,158,11,0.1)", background: "rgba(245,158,11,0.03)" }}>
            {["Foto", "Producto", "SKU", "Stock", "Mínimo", "Estado", "Acción"].map((col, i) => (
              <th
                key={col}
                className={`px-4 py-4 text-xs font-mono font-semibold uppercase tracking-[0.12em] ${i === 6 ? "text-right" : "text-left"}`}
                style={{ color: "#78350f" }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <InventoryRow key={p.id} product={p} />
          ))}
        </tbody>
      </table>

      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)" }} />
    </div>
  );
}
