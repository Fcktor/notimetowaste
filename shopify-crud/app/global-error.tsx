"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ background: "#FBFBFA", color: "#2F3437", fontFamily: "DM Sans, sans-serif" }}>
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-3" style={{ color: "#787774" }}>
              Error
            </p>
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Algo salió mal
            </h2>
            <p className="text-sm mb-6" style={{ color: "#787774" }}>
              No pudimos cargar esta página. Intenta de nuevo.
            </p>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-md text-sm font-semibold transition-all bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98]"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
