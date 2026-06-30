import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"
import { CF_GET } from "@/lib/config"
import { getCollections, matchesRule } from "@/lib/collectionsStore"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Eres ARIA, la asistente inteligente de administración para No Time To Waste, una tienda de relojes.
Responde siempre en español, de forma clara y concisa.
Tienes acceso a herramientas para consultar el inventario de relojes y las colecciones de la tienda en tiempo real.
Usa las herramientas cuando el usuario pregunte sobre productos, stock, colecciones, marcas, estilos o estadísticas.
Sé amigable y profesional. Usa listas cuando presentes múltiples productos o datos.
Cuando menciones precios, usa el símbolo $ y formatea los números correctamente.`

const tools: Anthropic.Tool[] = [
  {
    name: "get_products",
    description: "Obtiene los relojes del inventario. Filtra opcionalmente por un campo específico.",
    input_schema: {
      type: "object" as const,
      properties: {
        filter_field: {
          type: "string",
          description: "Campo por el que filtrar: brand, style, movement, gender, condition, dial_color, strap_material, case_material. Opcional.",
        },
        filter_value: {
          type: "string",
          description: "Valor a buscar en el campo. Requerido si filter_field está presente.",
        },
      },
    },
  },
  {
    name: "get_collections",
    description: "Obtiene las colecciones automáticas de la tienda con la cantidad de productos en cada una.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
]

type ProductRecord = Record<string, unknown>

async function fetchProducts(): Promise<ProductRecord[]> {
  const res = await fetch(CF_GET, { cache: "no-store" })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : (data.products ?? [])
}

async function runTool(name: string, input: Record<string, string>): Promise<string> {
  if (name === "get_products") {
    const products = await fetchProducts()
    let list = products

    if (input.filter_field && input.filter_value) {
      list = products.filter(p => matchesRule(p, input.filter_field, input.filter_value))
    }

    return JSON.stringify(
      list.map(p => ({
        brand: p.brand,
        model: p.model ?? p.title,
        price: p.price,
        stock: p.stock ?? p.availability,
        style: p.style,
        movement: p.movement,
        gender: p.gender,
        condition: p.condition,
        dial_color: p.dial_color,
      }))
    )
  }

  if (name === "get_collections") {
    const [products, collections] = await Promise.all([fetchProducts(), Promise.resolve(getCollections())])

    return JSON.stringify(
      collections.map(col => ({
        name: col.name,
        rule: `${col.rule_field} = ${col.rule_value}`,
        product_count: products.filter(p => matchesRule(p, col.rule_field, col.rule_value)).length,
      }))
    )
  }

  return JSON.stringify({ error: `Herramienta desconocida: ${name}` })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { messages } = await req.json()
  if (!Array.isArray(messages))
    return NextResponse.json({ error: "messages requerido" }, { status: 400 })

  const history: Anthropic.MessageParam[] = messages.map(
    (m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })
  )

  try {
    let response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM,
      tools,
      messages: history,
    })

    while (response.stop_reason === "tool_use") {
      const assistantContent = response.content
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of assistantContent) {
        if (block.type === "tool_use") {
          const result = await runTool(block.name, block.input as Record<string, string>)
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result })
        }
      }

      history.push({ role: "assistant", content: assistantContent })
      history.push({ role: "user", content: toolResults })

      response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM,
        tools,
        messages: history,
      })
    }

    const text = response.content.find(b => b.type === "text")
    return NextResponse.json({ reply: (text as Anthropic.TextBlock | undefined)?.text ?? "" })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Chat error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
