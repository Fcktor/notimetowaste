import { ProductForm } from "@/components/ProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin" className="text-[10px] font-mono tracking-widest uppercase transition-colors" style={{ color: "var(--muted-foreground)" }}>
            Productos
          </Link>
          <span style={{ color: "var(--muted-foreground)" }} className="text-[10px]">/</span>
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--foreground)" }}>Nuevo</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: "var(--primary)" }} />
          <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Crear producto</h1>
        </div>
        <p className="text-xs font-mono mt-1 ml-4" style={{ color: "var(--muted-foreground)" }}>
          SYS://BIGQUERY → INSERT
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
