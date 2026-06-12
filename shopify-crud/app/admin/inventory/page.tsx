import { CF_GET } from "@/lib/config";
import { InventoryTable } from "@/components/InventoryTable";

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

export default async function InventoryPage() {
  const products = await getProducts();
  const lowStock = products.filter(
    (p: { stock: number; stock_min_threshold: number }) =>
      p.stock <= (p.stock_min_threshold ?? 5)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #f59e0b, #ef4444)" }} />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase" style={{ color: "#92400e" }}>
                SYS://INVENTORY
              </span>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.8)" }} />
            </div>
          </div>
          <div className="flex items-baseline gap-3 pl-4">
            <h1 className="text-2xl font-bold tracking-tight" style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Inventario
            </h1>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              {products.length} productos
            </span>
            {lowStock.length > 0 && (
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {lowStock.length} stock bajo
              </span>
            )}
          </div>
        </div>
      </div>

      <InventoryTable products={products} />
    </div>
  );
}
