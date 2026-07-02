import Link from "next/link";
import { notFound } from "next/navigation";
import { CF_GET, WHATSAPP_NUMBER } from "@/lib/config";
import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CartDrawer } from "@/components/CartDrawer";
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
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #EAEAEA" }}>
      <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: "#787774", fontFamily: "var(--font-geist-sans)" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "#2F3437", fontFamily: "var(--font-geist-sans)" }}>
        {value}
      </span>
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

  const whatsappText = encodeURIComponent(
    `Hola! Me interesa el reloj ${product.brand} ${product.model} (S/ ${product.price}). ¿Está disponible?`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  const hasSpecs = product.movement || product.case_diameter_mm != null ||
    product.case_material || product.strap_material ||
    product.dial_color || product.water_resistance_m != null;

  return (
    <div className="min-h-screen" style={{ background: "#FBFBFA" }}>
      <StorefrontHeader />
      <CartDrawer />

      <div className="max-w-5xl mx-auto px-6 pt-8 pb-20">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] mb-10 transition-colors duration-200"
          style={{ color: "rgba(120,119,116,0.6)" }}
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">

          {/* ── Imagen ── */}
          <div className="flex flex-col items-center">
            <div
              className="w-full overflow-hidden"
              style={{
                aspectRatio: "1/1",
                background: "#F1F0ED",
                border: "1px solid #EAEAEA",
                borderRadius: "0.5rem",
              }}
            >
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={`${product.brand} ${product.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="56" height="56" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.15 }}>
                    <circle cx="16" cy="16" r="14" stroke="#787774" strokeWidth="1" />
                    <line x1="16" y1="4" x2="16" y2="7.5" stroke="#787774" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="16" y1="16" x2="16" y2="9" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
                    <line x1="16" y1="16" x2="21" y2="16" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            {product.image_url && (
              <p className="text-[10px] uppercase tracking-[0.14em] mt-3 text-center" style={{ color: "rgba(120,119,116,0.55)" }}>
                Imagen referencial — el producto real puede variar ligeramente en detalles
              </p>
            )}
          </div>

          {/* ── Info ── */}
          <div className="flex flex-col gap-6">

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.condition && (
                <span
                  className="text-[9px] uppercase tracking-[0.18em] px-2.5 py-1"
                  style={{
                    color: product.condition === "Vintage" ? "#111111" : "#787774",
                    border: `1px solid ${product.condition === "Vintage" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.12)"}`,
                    borderRadius: "2px",
                  }}
                >
                  {product.condition}
                </span>
              )}
              {product.style && (
                <span className="text-[9px] uppercase tracking-[0.18em] px-2.5 py-1"
                  style={{ color: "rgba(120,119,116,0.7)", border: "1px solid rgba(120,119,116,0.2)", borderRadius: "2px" }}>
                  {product.style}
                </span>
              )}
              {product.gender && (
                <span className="text-[9px] uppercase tracking-[0.18em] px-2.5 py-1"
                  style={{ color: "rgba(120,119,116,0.7)", border: "1px solid rgba(120,119,116,0.2)", borderRadius: "2px" }}>
                  {product.gender}
                </span>
              )}
            </div>

            {/* Brand + Model */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: "#787774" }}>
                {product.brand}
              </p>
              <h1
                className="font-display leading-tight"
                style={{ fontSize: "2.75rem", color: "#111111", fontWeight: 600, fontStyle: "italic" }}
              >
                {product.model}
              </h1>
              {product.sku && (
                <p className="text-[10px] mt-1.5 uppercase tracking-widest" style={{ color: "rgba(120,119,116,0.4)" }}>
                  SKU: {product.sku}
                </p>
              )}
            </div>

            {/* Precio */}
            <div className="flex items-baseline gap-3 py-4" style={{ borderTop: "1px solid #EAEAEA", borderBottom: "1px solid #EAEAEA" }}>
              <span className="text-4xl font-semibold tabular-nums" style={{ color: "#111111", fontFamily: "var(--font-geist-sans)" }}>
                S/ {product.price.toLocaleString("es-PE")}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-xl line-through tabular-nums" style={{ color: "rgba(120,119,116,0.45)" }}>
                    S/ {product.compare_at_price.toLocaleString("es-PE")}
                  </span>
                  {discount && (
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 tabular-nums"
                      style={{ color: "#111111", border: "1px solid rgba(0,0,0,0.3)", borderRadius: "2px" }}>
                      −{discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock */}
            <div>
              {inStock ? (
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--status-success-fg)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--status-success-fg)" }} />
                  Disponible — {product.stock} {product.stock === 1 ? "unidad" : "unidades"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--status-danger-fg)" }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--status-danger-fg)" }} />
                  Sin disponibilidad
                </span>
              )}
            </div>

            {/* Descripción */}
            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: "#787774" }}>
                {product.description}
              </p>
            )}

            {/* Specs */}
            {hasSpecs && (
              <div className="rounded-xl p-4" style={{ background: "#F1F0ED", border: "1px solid #EAEAEA" }}>
                <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ color: "rgba(120,119,116,0.45)" }}>
                  Especificaciones
                </p>
                {product.movement && <SpecRow label="Movimiento" value={product.movement} />}
                {product.case_diameter_mm != null && <SpecRow label="Diámetro caja" value={`${product.case_diameter_mm} mm`} />}
                {product.case_material && <SpecRow label="Material caja" value={product.case_material} />}
                {product.strap_material && <SpecRow label="Correa" value={product.strap_material} />}
                {product.dial_color && <SpecRow label="Color esfera" value={product.dial_color} />}
                {product.water_resistance_m != null && <SpecRow label="Resist. al agua" value={`${product.water_resistance_m} m`} />}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-2">
              {inStock ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 text-xs uppercase tracking-[0.14em] transition-all duration-200 rounded-md bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98]"
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.855L.057 23.882a.5.5 0 00.614.641l6.227-1.635A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-1.9 0-3.678-.513-5.2-1.407l-.373-.218-3.87 1.016 1.033-3.768-.24-.387A9.818 9.818 0 012.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
                  </svg>
                  Pedir por WhatsApp
                </a>
              ) : (
                <div
                  className="flex items-center justify-center w-full py-3.5 text-xs uppercase tracking-[0.14em] rounded-md"
                  style={{ color: "rgba(120,119,116,0.4)", border: "1px solid rgba(120,119,116,0.15)" }}
                >
                  Sin disponibilidad
                </div>
              )}
              <AddToCartButton product={product} inStock={inStock} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
