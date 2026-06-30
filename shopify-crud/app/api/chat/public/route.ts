import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { CF_GET } from "@/lib/config"
import { getCollections, matchesRule } from "@/lib/collectionsStore"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Eres Dani, la asistente virtual de No Time To Waste, una tienda especializada en relojes.
Responde siempre en español, de forma amigable, cálida y concisa.
Tu objetivo es ayudar a los clientes a encontrar el reloj perfecto para ellos.
Tienes acceso a herramientas para consultar el catálogo de relojes y las colecciones disponibles en tiempo real.
Usa las herramientas cuando el cliente pregunte sobre productos, disponibilidad, precios, colecciones, marcas o estilos.
Cuando menciones precios, usa el símbolo $ y formatea los números correctamente.
Usa un tono cercano y entusiasta — estás ayudando a alguien a elegir un reloj especial.

Información de soporte general (responde con esto cuando te pregunten):
- Envíos: realizamos envíos a todo el país, el tiempo de entrega es de 3 a 5 días hábiles.
- Garantía: todos nuestros relojes tienen garantía de 6 meses contra defectos de fábrica.
- Pagos: aceptamos tarjetas de crédito/débito y transferencia bancaria.
- Devoluciones: aceptamos devoluciones dentro de los 7 días siguientes a la recepción del producto.
- Contacto: para consultas adicionales pueden escribirnos a contacto@notimetowaste.com.`

const tools: Anthropic.Tool[] = [
  {
    name: "get_products",
    description: "Obtiene los relojes del catálogo. Filtra opcionalmente por un campo específico.",
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
    description: "Obtiene las colecciones de la tienda con la cantidad de productos en cada una.",
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
        strap_material: p.strap_material,
        case_material: p.case_material,
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
    console.error("Dani chat error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
