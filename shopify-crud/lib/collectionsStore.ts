import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs"
import path from "path"
import crypto from "crypto"

const DATA_DIR = path.join(process.cwd(), "data")
const FILE = path.join(DATA_DIR, "collections.json")

export interface WatchCollection {
  id: string
  name: string
  rule_field: string  // campo del reloj: dial_color, brand, style, movement, etc.
  rule_value: string  // valor a comparar: Rojo, Casio, Sport, etc.
  created_at: string
}

const FIELD_LABELS: Record<string, string> = {
  dial_color:    "Color de esfera",
  brand:         "Marca",
  style:         "Estilo",
  movement:      "Movimiento",
  gender:        "Género",
  condition:     "Condición",
  strap_material:"Material correa",
  case_material: "Material caja",
}
export { FIELD_LABELS }

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function atomicWrite(data: string) {
  const tmp = FILE + ".tmp"
  writeFileSync(tmp, data)
  renameSync(tmp, FILE)
}

export function matchesRule(product: Record<string, unknown>, rule_field: string, rule_value: string): boolean {
  return String(product[rule_field] ?? "").trim().toLowerCase() === rule_value.trim().toLowerCase()
}

export function getCollections(): WatchCollection[] {
  ensureDir()
  if (!existsSync(FILE)) return []
  try { return JSON.parse(readFileSync(FILE, "utf-8")) } catch { return [] }
}

export function createCollection(name: string, rule_field: string, rule_value: string): WatchCollection {
  ensureDir()
  const collections = getCollections()
  const col: WatchCollection = {
    id: crypto.randomUUID(),
    name,
    rule_field,
    rule_value,
    created_at: new Date().toISOString(),
  }
  collections.push(col)
  atomicWrite(JSON.stringify(collections, null, 2))
  return col
}

export function deleteCollection(id: string): boolean {
  const collections = getCollections()
  const next = collections.filter(c => c.id !== id)
  if (next.length === collections.length) return false
  atomicWrite(JSON.stringify(next, null, 2))
  return true
}
