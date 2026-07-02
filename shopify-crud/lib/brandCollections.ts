import { CF_GET } from "@/lib/config"

export interface BrandCollection {
  id: string
  brand: string
  product_count: number
}

async function getProducts(): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(CF_GET, { cache: "no-store" })
    const data = await res.json()
    return data.products ?? data ?? []
  } catch {
    return []
  }
}

export async function getBrandCollections(): Promise<BrandCollection[]> {
  const products = await getProducts()
  const counts = new Map<string, number>()
  for (const p of products) {
    const brand = String(p.brand ?? "").trim()
    if (!brand) continue
    counts.set(brand, (counts.get(brand) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([brand, product_count]) => ({ id: encodeURIComponent(brand), brand, product_count }))
    .sort((a, b) => a.brand.localeCompare(b.brand))
}

export async function getProductsByBrand(brand: string): Promise<Array<Record<string, unknown>>> {
  const products = await getProducts()
  return products.filter(p => String(p.brand ?? "").trim().toLowerCase() === brand.trim().toLowerCase())
}
