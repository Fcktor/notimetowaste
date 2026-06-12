const CF_GET = "https://shopifygetproducts-891152758094.southamerica-east1.run.app";

interface RawProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number;
  availability: string;
  image_link: string;
  link: string;
  brand: string;
  sku: string;
  barcode: string;
  variant_id: string;
  quantity: number | null;
}

async function getAllProducts(): Promise<RawProduct[]> {
  try {
    const res = await fetch(CF_GET, { cache: "no-store" });
    const data = await res.json();
    return data.products ?? data ?? [];
  } catch {
    return [];
  }
}

const COLUMNS: { key: keyof RawProduct; label: string }[] = [
  { key: "title",            label: "Título" },
  { key: "price",            label: "Precio" },
  { key: "compare_at_price", label: "Precio original" },
  { key: "quantity",         label: "Stock" },
  { key: "availability",     label: "Disponibilidad" },
  { key: "brand",            label: "Marca" },
  { key: "sku",              label: "SKU" },
  { key: "barcode",          label: "Código de barras" },
  { key: "description",      label: "Descripción" },
  { key: "variant_id",       label: "Variant ID" },
  { key: "id",               label: "Product GID" },
];

export default async function DatabasePage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1C2024]">Database</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            BigQuery · <span className="font-mono">m0ghu8_123.products</span> · {products.length} filas
          </p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono">
          SELECT * FROM products
        </span>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400 text-sm">
          No hay datos.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-auto">
          <table className="text-xs whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500 border-r border-gray-100 w-8">#</th>
                {COLUMNS.map(c => (
                  <th key={c.key} className="px-3 py-2 text-left font-medium text-gray-700 border-r border-gray-100">
                    {c.label}
                    <span className="ml-1 text-gray-400 font-normal font-mono">{c.key}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                  <td className="px-3 py-2 text-gray-400 border-r border-gray-100">{i + 1}</td>
                  {COLUMNS.map(c => (
                    <td key={c.key} className="px-3 py-2 border-r border-gray-100 max-w-[200px] truncate">
                      {c.key === "image_link" ? (
                        p.image_link
                          ? <a href={p.image_link} target="_blank" className="text-blue-500 underline">ver</a>
                          : <span className="text-gray-300">null</span>
                      ) : c.key === "id" || c.key === "variant_id" ? (
                        <span className="font-mono text-gray-500 text-[10px]">{p[c.key] || <span className="text-gray-300">null</span>}</span>
                      ) : p[c.key] == null || p[c.key] === "" ? (
                        <span className="text-gray-300 italic">null</span>
                      ) : (
                        <span>{String(p[c.key])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
