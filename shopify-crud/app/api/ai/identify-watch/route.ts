import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")

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
    // Descargar la imagen y convertir a base64
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return NextResponse.json({ error: "No se pudo obtener la imagen" }, { status: 400 })
    const imgBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(imgBuffer).toString("base64")
    const mimeType = imgRes.headers.get("content-type") ?? "image/jpeg"

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent([
      PROMPT,
      { inlineData: { data: base64, mimeType } },
    ])

    const text = result.response.text().trim()
    // Limpiar posible markdown que Gemini a veces agrega
    const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim()
    const watchData = JSON.parse(clean)

    return NextResponse.json({ success: true, data: watchData })
  } catch (err) {
    console.error("Gemini error:", err)
    return NextResponse.json({ error: "No se pudo identificar el reloj" }, { status: 500 })
  }
}
