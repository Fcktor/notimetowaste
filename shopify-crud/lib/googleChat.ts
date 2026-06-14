export async function sendChatMessage(text: string): Promise<void> {
  const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK
  if (!WEBHOOK_URL) return
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
  } catch (err) {
    console.error("Google Chat webhook error:", err)
  }
}

export function lowStockMessage(product: string, stock: number): string {
  return `⚠️ *ARIA comunica:* El producto "${product}" presenta stock bajo (${stock} unidades disponibles). ¿Desea actualizar el inventario?`
}

export function productCreatedMessage(brand: string, model: string, sku: string): string {
  return `✅ *ARIA comunica:* Nuevo producto registrado — *${brand} ${model}* (SKU: ${sku})`
}

export function productUpdatedMessage(brand: string, model: string): string {
  return `✏️ *ARIA comunica:* Producto actualizado — *${brand} ${model}*`
}

export function productDeletedMessage(product: string): string {
  return `🗑️ *ARIA comunica:* El producto "${product}" fue eliminado del catálogo.`
}

export function collectionCreatedMessage(name: string, field: string, value: string): string {
  return `📂 *ARIA comunica:* Nueva colección creada — *${name}* (regla: ${field} = ${value})`
}

export function inventoryUpdatedMessage(product: string, oldStock: number, newStock: number): string {
  return `📦 *ARIA comunica:* Inventario actualizado — "${product}": ${oldStock} → ${newStock} unidades.`
}
