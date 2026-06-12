import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs"
import path from "path"
import crypto from "crypto"

const DATA_DIR    = path.join(process.cwd(), "data")
const PENDING_FILE = path.join(DATA_DIR, "pending.json")

const MAX_ATTEMPTS = 5

export interface PendingEntry {
  email: string
  name: string
  passwordHash: string
  code: string
  expiresAt: number
  attempts: number
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

function atomicWrite(file: string, data: string) {
  const tmp = file + ".tmp"
  writeFileSync(tmp, data)
  renameSync(tmp, file)
}

function readAll(): PendingEntry[] {
  ensureDir()
  if (!existsSync(PENDING_FILE)) return []
  try { return JSON.parse(readFileSync(PENDING_FILE, "utf-8")) } catch { return [] }
}

function writeAll(entries: PendingEntry[]) {
  ensureDir()
  atomicWrite(PENDING_FILE, JSON.stringify(entries, null, 2))
}

export function savePending(entry: Omit<PendingEntry, "attempts">) {
  const lower = entry.email.toLowerCase()
  const all = readAll().filter(e => e.email !== lower)
  all.push({ ...entry, email: lower, attempts: 0 })
  writeAll(all)
}

export function getPending(email: string): PendingEntry | undefined {
  const now = Date.now()
  return readAll().find(e => e.email === email.toLowerCase() && e.expiresAt > now)
}

// Returns false if the entry is now locked (too many attempts).
export function recordAttempt(email: string): boolean {
  const lower = email.toLowerCase()
  const all = readAll()
  const idx = all.findIndex(e => e.email === lower)
  if (idx === -1) return false
  all[idx].attempts += 1
  if (all[idx].attempts >= MAX_ATTEMPTS) {
    all.splice(idx, 1)
    writeAll(all)
    return false
  }
  writeAll(all)
  return true
}

export function deletePending(email: string) {
  writeAll(readAll().filter(e => e.email !== email.toLowerCase()))
}

// Cryptographically secure 6-digit code.
export function generateCode(): string {
  return String(crypto.randomInt(100_000, 1_000_000))
}
