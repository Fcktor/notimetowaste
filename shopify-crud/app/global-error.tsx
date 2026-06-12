"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Algo salió mal</h2>
            <button
              onClick={reset}
              className="px-4 py-2 bg-[#3D63DD] text-white rounded text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
