import { ProductForm } from "@/components/ProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-[10px] font-mono tracking-widest uppercase transition-colors" style={{ color: "#1e3a5f" }}>
            Productos
          </Link>
          <span style={{ color: "#1e3a5f" }} className="text-[10px]">/</span>
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#3b82f6" }}>Nuevo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #3b82f6, #06b6d4)" }} />
          <h1 className="text-2xl font-bold tracking-tight text-gradient-blue">Crear producto</h1>
        </div>
        <p className="text-xs font-mono mt-1 ml-4" style={{ color: "#1e3a5f" }}>
          SYS://BIGQUERY → INSERT
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
