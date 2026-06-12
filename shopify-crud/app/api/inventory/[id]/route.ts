import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { CF_UPDATE } from "@/lib/config"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })

  const { id } = await params
  const { stock } = await req.json()

  if (stock == null || isNaN(Number(stock)) || Number(stock) < 0)
    return NextResponse.json({ error: "stock inválido" }, { status: 400 })

  const res = await fetch(CF_UPDATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: decodeURIComponent(id), stock: Number(stock) }),
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
