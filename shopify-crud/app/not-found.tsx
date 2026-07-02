import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-4" style={{ color: "#787774" }}>
          Error 404
        </p>
        <h1 className="font-display text-5xl mb-3" style={{ color: "#2F3437" }}>
          Página no encontrada
        </h1>
        <p className="text-sm mb-8" style={{ color: "#787774" }}>
          El reloj o la colección que buscas ya no está disponible, o el enlace es incorrecto.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition-all bg-[#111111] text-white hover:bg-[#333333] active:scale-[0.98]"
        >
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
