import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs"
import path from "path"
import crypto from "crypto"

const DATA_DIR  = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DATA_DIR, "users.json")

export interface RegisteredUser {
  id: string
  name: string
  email: string
  passwordHash: string
  role: "user"
  createdAt: string
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

// Atomic write: write to a temp file then rename (POSIX-atomic).
function atomicWrite(file: string, data: string) {
  const tmp = file + ".tmp"
  writeFileSync(tmp, data)
  renameSync(tmp, file)
}

export function getRegisteredUsers(): RegisteredUser[] {
  ensureDir()
  if (!existsSync(USERS_FILE)) return []
  try { return JSON.parse(readFileSync(USERS_FILE, "utf-8")) } catch { return [] }
}

export function saveRegisteredUser(user: RegisteredUser) {
  ensureDir()
  const users = getRegisteredUsers()
  // Guard against duplicate email (race-condition safety net)
  if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) return
  users.push(user)
  atomicWrite(USERS_FILE, JSON.stringify(users, null, 2))
}

// PBKDF2 with a random salt — format: "pbkdf2:<salt>:<hash>"
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex")
  return `pbkdf2:${salt}:${hash}`
}

// Supports both new PBKDF2 format and legacy SHA-256 (migration path).
export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("pbkdf2:")) {
    const [, salt, hash] = stored.split(":")
    const derived = crypto.pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex")
    const a = Buffer.from(derived, "hex")
    const b = Buffer.from(hash, "hex")
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  }
  // Legacy SHA-256 — compare then prompt re-hash on next login if needed
  const legacy = crypto.createHash("sha256").update(password).digest("hex")
  const a = Buffer.from(legacy)
  const b = Buffer.from(stored)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function findUserByEmail(email: string): RegisteredUser | undefined {
  return getRegisteredUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
}
