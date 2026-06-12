import Link from "next/link";
import { notFound } from "next/navigation";
import { CF_GET } from "@/lib/config";
import { AddToCartButton } from "@/components/AddToCartButton";

async function getProduct(id: string) {
  try {
    const res = await fetch(CF_GET, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const products = data.products ?? data ?? [];
    return products.find((p: { id: string }) => p.id === decodeURIComponent(id)) ?? null;
  } catch {
    return null;
  }
}

interface Watch {
  id: string;
  sku: string;
  brand: string;
  model: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  condition: string;
  style: string;
  movement?: string | null;
  case_diameter_mm?: number | null;
  case_material?: string | null;
  strap_material?: string | null;
  dial_color?: string | null;
  water_resistance_m?: number | null;
  gender?: string | null;
  description?: string | null;
  image_url?: string | null;
  available: boolean;
}

function SpecRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#475569" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "#e2e8f0" }}>{value}</span>
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product: Watch | null = await getProduct(id);

  if (!product) notFound();

  const inStock = product.available && product.stock > 0;
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <div className="min-h-screen" style={{ background: "#071030" }}>
      {/* Back */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider transition-colors"
          style={{ color: "#475569" }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="flex items-start justify-center">
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{ aspectRatio: "1/1", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={`${product.brand} ${product.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="#1e3a5f" strokeWidth={1}>
                  <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={product.condition === "Vintage"
                  ? { background: "#fef3c7", color: "#d97706" }
                  : { background: "#ecfdf5", color: "#059669" }}
              >
                {product.condition}
              </span>
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8" }}
              >
                {product.style}
              </span>
              {product.gender && (
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.07)", color: "#94a3b8" }}
                >
                  {product.gender}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#3b82f6" }}>
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold text-white leading-tight">{product.model}</h1>
            <p className="text-xs font-mono mt-1" style={{ color: "#334155" }}>SKU: {product.sku}</p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold" style={{ color: "#3b82f6" }}>
              S/ {product.price}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-lg line-through" style={{ color: "#475569" }}>
                  S/ {product.compare_at_price}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#fce7f3", color: "#db2777" }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div>
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                En stock — {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                Agotado
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
              {product.description}
            </p>
          )}

          {/* Specs */}
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-2" style={{ color: "#1e3a5f" }}>
              Características
            </p>
            {product.movement && <SpecRow label="Movimiento" value={product.movement} />}
            {product.case_diameter_mm != null && <SpecRow label="Diámetro caja" value={`${product.case_diameter_mm} mm`} />}
            {product.case_material && <SpecRow label="Material caja" value={product.case_material} />}
            {product.strap_material && <SpecRow label="Correa" value={product.strap_material} />}
            {product.dial_color && <SpecRow label="Color esfera" value={product.dial_color} />}
            {product.water_resistance_m != null && <SpecRow label="Resist. al agua" value={`${product.water_resistance_m} m`} />}
          </div>

          {/* Add to cart */}
          <AddToCartButton product={product} inStock={inStock} />
        </div>
      </div>
    </div>
  );
}
