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
            <div className="w-1 h-6 rounded-full" style={{ background: "var(--primary)" }} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--muted-foreground)" }}>
                SYS://CATALOG
              </span>
              <span className="w-1.5 h-1.5 rounded-full pulse-neon inline-block" style={{ background: "var(--muted-foreground)" }} />
            </div>
          </div>
          <div className="flex items-baseline gap-3 pl-4">
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Productos</h1>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            >
              {products.length} items
            </span>
          </div>
        </div>

        <Link href="/admin/products/new">
          <button
            className="btn-cyber flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
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
