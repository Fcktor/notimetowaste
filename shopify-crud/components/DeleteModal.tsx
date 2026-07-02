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
    await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName: productTitle }),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
        style={{ color: "var(--status-danger-fg)", background: "var(--status-danger-bg)" }}
        title="Eliminar"
      >
        <TrashIcon />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--foreground)" }}>
              Gestionar:{" "}
              <span style={{ color: "var(--foreground)" }}>{productTitle}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <button
              onClick={handleReduceOne}
              disabled={loading || quantity == null || quantity <= 0}
              className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
              style={{ background: "var(--status-warning-bg)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => {
                if (!(quantity == null || quantity <= 0)) {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--status-warning-fg)" }}>Reducir 1 unidad</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {quantity != null && quantity > 0
                  ? `Stock actual: ${quantity} → ${quantity - 1}`
                  : "Sin stock disponible"}
              </p>
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={loading}
              className="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-150"
              style={{ background: "var(--status-danger-bg)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--status-danger-fg)" }}>Eliminar producto</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Se elimina de Shopify y BigQuery. No se puede deshacer.</p>
            </button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="transition-colors"
              style={{ background: "transparent", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
