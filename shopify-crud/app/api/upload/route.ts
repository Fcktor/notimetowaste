import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CF_UPLOAD } from "@/lib/config"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file)
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG, WEBP o GIF" }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")

    const res = await fetch(CF_UPLOAD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64 }),
    })

    const data = await res.json()
    if (!res.ok)
      return NextResponse.json({ error: data.error ?? "Error al subir" }, { status: 500 })

    return NextResponse.json({ url: data.url })
  } catch (err) {
    console.error("Upload proxy error:", err)
    return NextResponse.json({ error: "Error interno al subir la imagen" }, { status: 500 })
  }
}
