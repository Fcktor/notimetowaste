import { ProductForm } from "@/components/ProductForm";
import Link from "next/link";

import { CF_GET } from "@/lib/config";

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

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-500">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-[10px] font-mono tracking-widest uppercase transition-colors" style={{ color: "#1e3a5f" }}>
            Productos
          </Link>
          <span style={{ color: "#1e3a5f" }} className="text-[10px]">/</span>
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#3b82f6" }}>Editar</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #3b82f6, #06b6d4)" }} />
          <h1 className="text-2xl font-bold tracking-tight text-gradient-blue">Editar producto</h1>
        </div>
        <p className="text-xs font-mono mt-1 ml-4" style={{ color: "#1e3a5f" }}>
          SYS://BIGQUERY → UPDATE
        </p>
      </div>
      <ProductForm
        mode="edit"
        productId={product.id}
        defaultValues={{
          brand: product.brand ?? "",
          model: product.model ?? "",
          price: String(product.price ?? ""),
          compare_at_price: product.compare_at_price != null ? String(product.compare_at_price) : "",
          stock: String(product.stock ?? ""),
          condition: product.condition ?? "",
          style: product.style ?? "",
          movement: product.movement ?? "",
          case_diameter_mm: product.case_diameter_mm != null ? String(product.case_diameter_mm) : "",
          case_material: product.case_material ?? "",
          strap_material: product.strap_material ?? "",
          dial_color: product.dial_color ?? "",
          water_resistance_m: product.water_resistance_m != null ? String(product.water_resistance_m) : "",
          gender: product.gender ?? "",
          description: product.description ?? "",
          image_url: product.image_url ?? "",
          available: product.available !== false,
        }}
      />
    </div>
  );
}
