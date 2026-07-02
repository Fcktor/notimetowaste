"use client"
import { useRef, useState, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "¡Hola! Soy **Dani**, tu asistente de No Time To Waste.\n\nEstoy aquí para ayudarte a encontrar el reloj perfecto. Puedo contarte sobre:\n- Nuestro catálogo y precios\n- Disponibilidad de stock\n- Colecciones disponibles\n- Envíos, garantías y devoluciones\n\n¿En qué puedo ayudarte hoy?",
}

function AssistantText({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2">
              <span style={{ color: "#787774" }}>•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          )
        }
        if (line === "") return <div key={i} className="h-1" />
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ color: "#111111" }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function DaniWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: "user", content: text }
    const conversationHistory = messages[0] === WELCOME
      ? [userMsg]
      : [...messages, userMsg]

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      })
      const data = await res.json()
      const reply = data.reply ?? data.error ?? "No pude obtener una respuesta. Intenta de nuevo."
      setMessages(prev => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }])
    } finally {
      setLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 360,
            height: 520,
            background: "#FFFFFF",
            border: "1px solid #EAEAEA",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "#F9F9F8",
              borderBottom: "1px solid #EAEAEA",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold"
                style={{
                  background: "#111111",
                  color: "#FFFFFF",
                }}
              >
                D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "#2F3437" }}>
                    Dani
                  </span>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "#F1F0ED",
                      color: "#787774",
                      border: "1px solid #EAEAEA",
                    }}
                  >
                    EN LÍNEA
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: "#787774" }}>
                  Asistente virtual · No Time To Waste
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ color: "#787774" }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} className="flex gap-2.5 max-w-[88%]">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold"
                    style={{ background: "#111111", color: "#FFFFFF" }}
                  >
                    D
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: "#F1F0ED",
                      border: "1px solid #EAEAEA",
                      color: "#2F3437",
                    }}
                  >
                    <AssistantText text={msg.content} />
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <div
                    className="rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed max-w-[78%]"
                    style={{
                      background: "#111111",
                      border: "1px solid #111111",
                      color: "#FFFFFF",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex gap-2.5 max-w-[88%]">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: "#111111", color: "#FFFFFF" }}
                >
                  D
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-3.5 py-3"
                  style={{
                    background: "#F1F0ED",
                    border: "1px solid #EAEAEA",
                  }}
                >
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map(j => (
                      <span
                        key={j}
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{
                          background: "#787774",
                          animation: `dani-bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex-shrink-0 px-3 py-3"
            style={{
              borderTop: "1px solid #EAEAEA",
              background: "#FFFFFF",
            }}
          >
            <div
              className="flex gap-2 items-end rounded-xl p-2"
              style={{
                background: "#F9F9F8",
                border: "1px solid #EAEAEA",
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Pregunta sobre relojes, stock, envíos..."
                rows={1}
                disabled={loading}
                className="flex-1 resize-none bg-transparent text-sm outline-none py-1.5 px-2"
                style={{
                  color: "#2F3437",
                  caretColor: "#111111",
                  maxHeight: "100px",
                  lineHeight: "1.5",
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-[0.98] ${
                  loading || !input.trim() ? "bg-[#EAEAEA]" : "bg-[#111111] hover:bg-[#333333]"
                }`}
                style={{
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={loading || !input.trim() ? "#787774" : "#FFFFFF"}
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 bg-[#111111] hover:bg-[#333333]"
        style={{
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          transform: open ? "scale(0.95)" : "scale(1)",
        }}
        aria-label={open ? "Cerrar chat" : "Abrir chat con Dani"}
      >
        {open ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes dani-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
