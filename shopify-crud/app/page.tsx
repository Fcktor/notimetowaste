import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CartDrawer } from "@/components/CartDrawer";
import { StorefrontFilters } from "@/components/StorefrontFilters";
import { CF_GET } from "@/lib/config";

async function getProducts() {
  try {
    const res = await fetch(CF_GET, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? data ?? [];
  } catch {
    return [];
  }
}

interface Product {
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
  gender?: string | null;
  image_url?: string | null;
  available: boolean;
}

function WatchFaceGhost() {
  const cx = 240, cy = 240;

  const hourMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const isMain = i % 3 === 0;
    const outerR = 205;
    const innerR = isMain ? 180 : 195;
    return {
      x1: cx + outerR * Math.cos(angle),
      y1: cy + outerR * Math.sin(angle),
      x2: cx + innerR * Math.cos(angle),
      y2: cy + innerR * Math.sin(angle),
      isMain,
    };
  });

  const minuteMarks = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null;
    const angle = (i * 6 - 90) * (Math.PI / 180);
    return {
      x1: cx + 205 * Math.cos(angle),
      y1: cy + 205 * Math.sin(angle),
      x2: cx + 200 * Math.cos(angle),
      y2: cy + 200 * Math.sin(angle),
    };
  }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];

  return (
    <svg
      viewBox="0 0 480 480"
      aria-hidden
      className="watch-ghost absolute pointer-events-none"
      style={{ width: 560, height: 560, right: -60, top: "50%", transform: "translateY(-50%)" }}
    >
      <circle cx={cx} cy={cy} r={228} fill="none" stroke="#C4A35A" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={212} fill="none" stroke="#C4A35A" strokeWidth="0.5" opacity="0.5" />

      {minuteMarks.map((m, i) => (
        <line key={`m${i}`}
          x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke="#C4A35A" strokeWidth="0.6" />
      ))}

      {hourMarks.map((m, i) => (
        <line key={`h${i}`}
          x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
          stroke="#C4A35A" strokeWidth={m.isMain ? "2" : "1"} />
      ))}

      <circle cx={cx} cy={cy} r={5} fill="none" stroke="#C4A35A" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={1.5} fill="#C4A35A" />
    </svg>
  );
}

export default async function StorefrontPage() {
  const products: Product[] = await getProducts();

  return (
    <div className="min-h-screen" style={{ background: "#0C0B09" }}>
      <StorefrontHeader />
      <CartDrawer />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "38vh" }}>
        <WatchFaceGhost />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-12">
          <p
            className="hero-line-1 text-xs uppercase tracking-[0.22em] mb-6"
            style={{ color: "rgba(196,163,90,0.65)", fontFamily: "var(--font-dm-sans)" }}
          >
            Colección 2025
          </p>

          <h1 className="font-display leading-[0.95]" style={{ color: "#EDE8DF" }}>
            <span className="hero-line-1 block text-[4.5rem] sm:text-[5.5rem] italic font-light">
              Relojes
            </span>
            <span className="hero-line-2 block text-[4.5rem] sm:text-[5.5rem] italic font-light"
              style={{ color: "rgba(237,232,223,0.55)" }}>
              que definen
            </span>
            <span className="hero-line-3 block text-[4.5rem] sm:text-[5.5rem] italic font-light">
              cada momento
            </span>
          </h1>

          <p
            className="hero-sub mt-7 text-sm max-w-xs leading-relaxed"
            style={{ color: "#7A6E64", fontFamily: "var(--font-dm-sans)" }}
          >
            Piezas seleccionadas a pedido.
            Cada reloj, entregado con garantía.
          </p>

          {/* Divider */}
          <div className="mt-10 flex items-center gap-4">
            <div style={{ width: 32, height: 1, background: "rgba(196,163,90,0.4)" }} />
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(196,163,90,0.5)" }}>
              Explorar colección
            </span>
            <div style={{ flex: 1, maxWidth: 80, height: 1, background: "rgba(196,163,90,0.15)" }} />
          </div>
        </div>
      </section>

      {/* ── Catálogo ── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {products.length === 0 ? (
          <div className="text-center py-28">
            <div className="inline-block mb-4" style={{ opacity: 0.18 }}>
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#C4A35A" strokeWidth="1.2" />
                <line x1="16" y1="4" x2="16" y2="7.5" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="16" x2="16" y2="9" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
                <line x1="16" y1="16" x2="21" y2="16" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "#7A6E64" }}>
              No hay piezas disponibles en este momento.
            </p>
          </div>
        ) : (
          <StorefrontFilters products={products} />
        )}
      </section>

      {/* ── Footer mínimo ── */}
      <footer
        className="border-t"
        style={{ borderColor: "rgba(196,163,90,0.1)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <span
            className="font-display italic text-base tracking-widest"
            style={{ color: "rgba(196,163,90,0.4)" }}
          >
            Reech Store
          </span>
          <p className="text-xs" style={{ color: "rgba(122,110,100,0.5)" }}>
            Todos los relojes se gestionan a pedido.
          </p>
        </div>
      </footer>
    </div>
  );
}
