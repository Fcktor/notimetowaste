export async function sendChatMessage(text: string): Promise<void> {
  const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK
  console.log("[googleChat] sendChatMessage called. WEBHOOK_URL set:", !!WEBHOOK_URL)
  if (!WEBHOOK_URL) {
    console.warn("[googleChat] GOOGLE_CHAT_WEBHOOK no está definida — alerta no enviada")
    return
  }
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    console.log("[googleChat] Webhook enviado. Status:", res.status)
  } catch (err) {
    console.error("[googleChat] Error enviando webhook:", err)
  }
}

export function lowStockMessage(product: string, stock: number): string {
  return `⚠️ *ARIA comunica:* El producto "${product}" presenta stock bajo (${stock} unidades disponibles). ¿Desea actualizar el inventario?`
}

export function productCreatedMessage(brand: string, model: string, sku: string): string {
  return `✅ *ARIA comunica:* Nuevo producto registrado — *${brand} ${model}* (SKU: ${sku})`
}

export function productDeletedMessage(product: string): string {
  return `🗑️ *ARIA comunica:* El producto "${product}" fue eliminado del catálogo.`
}

export function inventoryUpdatedMessage(product: string, oldStock: number, newStock: number): string {
  return `📦 *ARIA comunica:* Inventario actualizado — "${product}": ${oldStock} → ${newStock} unidades.`
}
