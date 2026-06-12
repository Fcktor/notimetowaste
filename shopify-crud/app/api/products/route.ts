import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CF_CREATE } from "@/lib/config"
import { sendChatMessage, productCreatedMessage } from "@/lib/googleChat"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const body = await req.json()
  const res = await fetch(CF_CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const data = await res.json()

  if (res.ok && body.brand && body.model) {
    sendChatMessage(productCreatedMessage(body.brand, body.model, data.sku ?? ""))
  }

  return NextResponse.json(data, { status: res.status })
}
