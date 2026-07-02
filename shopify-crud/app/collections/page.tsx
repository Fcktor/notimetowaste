import Link from "next/link"
import { StorefrontHeader } from "@/components/StorefrontHeader"
import { CartDrawer } from "@/components/CartDrawer"
import { getBrandCollections } from "@/lib/brandCollections"

export default async function CollectionsPage() {
  const collections = await getBrandCollections()

  return (
    <div className="min-h-screen" style={{ background: "#FBFBFA" }}>
      <style>{`
        .col-card { border: 1px solid #EAEAEA; transition: border-color 0.3s; }
        .col-card:hover { border-color: #111111; }
      `}</style>
      <StorefrontHeader />
      <CartDrawer />

      <main className="max-w-7xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-4" style={{ color: "#787774" }}>
            Categorías
          </p>
          <h1
            className="font-display italic leading-tight"
            style={{ fontSize: "3rem", color: "#2F3437", fontWeight: 400 }}
          >
            Colecciones
          </h1>
          <p className="text-sm mt-3" style={{ color: "#787774" }}>
            Relojes organizados por marca
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: "#787774" }}>
              No hay colecciones disponibles por el momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(col => (
              <Link key={col.id} href={`/collections/${col.id}`} className="group">
                <div
                  className="col-card p-6 h-full flex flex-col justify-between"
                  style={{ background: "#FFFFFF", borderRadius: "0.5rem" }}
                >
                  <div>
                    {/* Icono reloj */}
                    <div className="mb-5">
                      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.4 }}>
                        <circle cx="16" cy="16" r="14" stroke="#787774" strokeWidth="1" />
                        <line x1="16" y1="4" x2="16" y2="7" stroke="#787774" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="16" y1="16" x2="16" y2="9.5" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
                        <line x1="16" y1="16" x2="21" y2="16" stroke="#787774" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </div>

                    <h2
                      className="font-display italic text-xl mb-1.5 transition-colors duration-200"
                      style={{ color: "#111111", fontWeight: 600 }}
                    >
                      {col.brand}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgba(120,119,116,0.6)" }}>
                      Marca
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: "1px solid #EAEAEA" }}>
                    <span className="text-[10px] uppercase tracking-widest" style={{ color: "#787774" }}>
                      {col.product_count} {col.product_count === 1 ? "reloj" : "relojes"}
                    </span>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#787774" strokeWidth={1.5} style={{ opacity: 0.5, transition: "opacity 0.2s" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
