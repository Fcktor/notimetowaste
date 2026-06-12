"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function TrashIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export function DeleteModal({
  productId,
  productTitle,
  quantity,
}: {
  productId: string;
  productTitle: string;
  quantity: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReduceOne() {
    if (quantity == null || quantity <= 0) return;
    setLoading(true);
    await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantity - 1 }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  async function handleDeleteAll() {
    setLoading(true);
    await fetch(`/api/products/${encodeURIComponent(productId)}`, { method: "DELETE" });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
        style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
        title="Eliminar"
      >
        <TrashIcon />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{ background: "#0d1424", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-slate-200">
              Gestionar:{" "}
              <span style={{ color: "#3b82f6" }}>{productTitle}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <button
              onClick={handleReduceOne}
              disabled={loading || quantity == null || quantity <= 0}
              className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
              onMouseEnter={(e) => {
                if (!(quantity == null || quantity <= 0)) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,158,11,0.06)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.15)";
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#fbbf24" }}>Reducir 1 unidad</p>
              <p className="text-xs mt-0.5" style={{ color: "#78716c" }}>
                {quantity != null && quantity > 0
                  ? `Stock actual: ${quantity} → ${quantity - 1}`
                  : "Sin stock disponible"}
              </p>
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={loading}
              className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-150"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.15)";
              }}
            >
              <p className="text-sm font-medium" style={{ color: "#f87171" }}>Eliminar producto</p>
              <p className="text-xs mt-0.5" style={{ color: "#6b4a4a" }}>Se elimina de Shopify y BigQuery. No se puede deshacer.</p>
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-slate-400 transition-colors"
              style={{ background: "transparent", borderColor: "rgba(255,255,255,0.1)" }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
