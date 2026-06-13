import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPT = `Analiza esta imagen de reloj e identifica el modelo exacto.
Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin bloques de código, sin explicaciones) con estos campos para el mercado latinoamericano:

{
  "brand": "marca del reloj",
  "model": "modelo exacto (ej: G-Shock GA-2100-1A1)",
  "movement": "Cuarzo o Automático o Solar",
  "case_diameter_mm": número en mm o null,
  "case_material": "material de la caja o null",
  "strap_material": "material de la correa o null",
  "dial_color": "color principal de la esfera o null",
  "water_resistance_m": número en metros o null,
  "gender": "Hombre o Mujer o Unisex",
  "condition": "Nuevo o Vintage",
  "style": "Sport o Dress o Casual",
  "description": "descripción comercial de 2-3 oraciones atractiva para venta en Latinoamérica"
}

Prioriza especificaciones oficiales para LATAM. Si no puedes identificar un campo con certeza, usa null.`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { imageUrl } = await req.json()
  if (!imageUrl) return NextResponse.json({ error: "imageUrl requerida" }, { status: 400 })

  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return NextResponse.json({ error: "No se pudo obtener la imagen" }, { status: 400 })
    const imgBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(imgBuffer).toString("base64")
    const mimeType = (imgRes.headers.get("content-type") ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()
    const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()
    const watchData = JSON.parse(clean)

    return NextResponse.json({ success: true, data: watchData })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Anthropic error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
