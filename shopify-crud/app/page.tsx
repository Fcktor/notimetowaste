import { StorefrontHeader } from "@/components/StorefrontHeader";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";

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

export default async function StorefrontPage() {
  const products: Product[] = await getProducts();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#071030" }}>
      {/* ── Background decorative blobs ── */}
      <div className="pointer-events-none select-none" aria-hidden>
        {/* Top-right blob */}
        <div
          className="blob-animate absolute"
          style={{
            width: 520,
            height: 520,
            top: -120,
            right: -80,
            background:
              "linear-gradient(135deg, #e8d8a0 0%, #c8a85a 20%, #7ba5e8 55%, #1a2f8f 100%)",
            opacity: 0.85,
            filter: "blur(2px)",
          }}
        />
        {/* Bottom-left soft glow */}
        <div
          className="absolute"
          style={{
            width: 600,
            height: 400,
            bottom: -100,
            left: -150,
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Center ambient light */}
        <div
          className="absolute"
          style={{
            width: 800,
            height: 800,
            top: "20%",
            left: "30%",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(200,168,90,0.06) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* ── Header & Cart ── */}
      <StorefrontHeader />
      <CartDrawer />

      {/* ── Hero ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.25em] mb-2"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              Colección
            </p>
            <h1
              className="text-5xl font-bold text-white leading-none tracking-tight"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
            >
              Relojes
            </h1>
          </div>
          <span
            className="text-xs font-mono px-3 py-1.5 rounded-lg self-end"
            style={{
              background: "rgba(255,255,255,0.07)",
              color: "rgba(191,219,254,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            {products.length} items
          </span>
        </div>

        {/* ── Product Grid ── */}
        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-sm">No hay productos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
