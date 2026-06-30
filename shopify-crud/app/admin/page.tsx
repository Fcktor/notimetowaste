import Link from "next/link";
import { ProductTable } from "@/components/ProductTable";

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

export default async function AdminPage() {
  const products = await getProducts();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full" style={{ background: "#C4A35A" }} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(196,163,90,0.6)" }}>
                SYS://CATALOG
              </span>
              <span className="w-1.5 h-1.5 rounded-full pulse-neon inline-block" style={{ background: "#C4A35A" }} />
            </div>
          </div>
          <div className="flex items-baseline gap-3 pl-4">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#C4A35A" }}>Productos</h1>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(196,163,90,0.1)", color: "#C4A35A", border: "1px solid rgba(196,163,90,0.2)" }}
            >
              {products.length} items
            </span>
          </div>
        </div>

        <Link href="/admin/products/new">
          <button
            className="btn-cyber flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              background: "#C4A35A",
              color: "#0C0B09",
              boxShadow: "0 4px 20px rgba(196,163,90,0.35), 0 0 0 1px rgba(196,163,90,0.2)",
            }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo producto
          </button>
        </Link>
      </div>

      <ProductTable products={products} />
    </div>
  );
}
