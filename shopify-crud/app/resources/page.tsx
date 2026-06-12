const CF_BASE = "https://southamerica-east1-project-7ae3e02e-3611-443d-bf7.cloudfunctions.net";

const FUNCTIONS = [
  { name: "shopifygetproducts",    url: "https://shopifygetproducts-891152758094.southamerica-east1.run.app",    desc: "Lee productos de BigQuery" },
  { name: "shopifyimportproduct",  url: "https://shopifyimportproduct-891152758094.southamerica-east1.run.app",   desc: "Importa productos desde Shopify" },
  { name: "shopifycreateproduct",  url: "https://shopifycreateproduct-if2wton52a-rj.a.run.app",                  desc: "Crea productos en Shopify + BigQuery" },
  { name: "shopifyupdateproduct",  url: "https://shopifyupdateproduct-if2wton52a-rj.a.run.app",                  desc: "Actualiza productos" },
  { name: "shopifydeleteproduct",  url: "https://shopifydeleteproduct-if2wton52a-rj.a.run.app",                  desc: "Elimina productos" },
  { name: "shopifyuploadimage",    url: "https://shopifyuploadimage-891152758094.southamerica-east1.run.app",     desc: "Sube imágenes a GCS" },
];

async function checkShopify() {
  try {
    const res = await fetch("https://shopifygetproducts-891152758094.southamerica-east1.run.app", { cache: "no-store" });
    const data = await res.json();
    const count = (data.products ?? data ?? []).length;
    return { ok: true, detail: `${count} productos en BigQuery` };
  } catch {
    return { ok: false, detail: "No se pudo conectar" };
  }
}

async function checkFunction(url: string) {
  try {
    const res = await fetch(url, { method: "OPTIONS", cache: "no-store" });
    return res.status < 500;
  } catch {
    return false;
  }
}

export default async function ResourcesPage() {
  const [shopify, ...fnStatuses] = await Promise.all([
    checkShopify(),
    ...FUNCTIONS.map(f => checkFunction(f.url)),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-[#1C2024]">Resources</h1>

      {/* Conexiones principales */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Conexiones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResourceCard
            name="Shopify"
            icon="🛍️"
            status={shopify.ok}
            detail={shopify.detail}
            meta="m0ghu8-yk.myshopify.com · API 2024-01"
          />
          <ResourceCard
            name="BigQuery"
            icon="🗄️"
            status={shopify.ok}
            detail="project-7ae3e02e · m0ghu8_123.products"
            meta="southamerica-east1"
          />
          <ResourceCard
            name="GCS Bucket"
            icon="🪣"
            status={true}
            detail="shopify-product-images-m0ghu8"
            meta="Imágenes de productos · público"
          />
        </div>
      </div>

      {/* Cloud Functions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cloud Functions</h2>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Función</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Descripción</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Región</th>
              </tr>
            </thead>
            <tbody>
              {FUNCTIONS.map((f, i) => (
                <tr key={f.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">{f.name}</td>
                  <td className="px-4 py-3 text-gray-600">{f.desc}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      fnStatuses[i] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${fnStatuses[i] ? "bg-green-500" : "bg-red-500"}`} />
                      {fnStatuses[i] ? "Activa" : "Error"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">southamerica-east1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ name, icon, status, detail, meta }: {
  name: string; icon: string; status: boolean; detail: string; meta: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-gray-800 text-sm">{name}</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status ? "bg-green-500" : "bg-red-500"}`} />
          {status ? "Conectado" : "Error"}
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-700">{detail}</p>
        <p className="text-xs text-gray-400 mt-0.5">{meta}</p>
      </div>
    </div>
  );
}
