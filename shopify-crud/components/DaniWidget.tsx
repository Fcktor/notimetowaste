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
              <span style={{ color: "#c8a85a" }}>•</span>
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
      <strong key={i} style={{ color: "#e8d8a0" }}>
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
            background: "rgba(12,11,9,0.97)",
            border: "1px solid rgba(196,163,90,0.22)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,163,90,0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "#0F0E0C",
              borderBottom: "1px solid rgba(196,163,90,0.12)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base font-bold"
                style={{
                  background: "linear-gradient(135deg, #c8a85a, #e8d8a0)",
                  color: "#071030",
                }}
              >
                D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "#e8d8a0" }}>
                    Dani
                  </span>
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(200,168,90,0.12)",
                      color: "#c8a85a",
                      border: "1px solid rgba(200,168,90,0.2)",
                    }}
                  >
                    EN LÍNEA
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: "rgba(200,168,90,0.5)" }}>
                  Asistente virtual · No Time To Waste
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(200,168,90,0.6)" }}
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
                    style={{ background: "linear-gradient(135deg, #c8a85a, #e8d8a0)", color: "#071030" }}
                  >
                    D
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: "rgba(196,163,90,0.06)",
                      border: "1px solid rgba(196,163,90,0.12)",
                      color: "#EDE8DF",
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
                      background: "rgba(196,163,90,0.12)",
                      border: "1px solid rgba(196,163,90,0.2)",
                      color: "#EDE8DF",
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
                  style={{ background: "linear-gradient(135deg, #c8a85a, #e8d8a0)", color: "#071030" }}
                >
                  D
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-3.5 py-3"
                  style={{
                    background: "rgba(200,168,90,0.07)",
                    border: "1px solid rgba(200,168,90,0.12)",
                  }}
                >
                  <div className="flex gap-1.5 items-center h-4">
                    {[0, 1, 2].map(j => (
                      <span
                        key={j}
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{
                          background: "#c8a85a",
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
              borderTop: "1px solid rgba(196,163,90,0.1)",
              background: "rgba(12,11,9,0.98)",
            }}
          >
            <div
              className="flex gap-2 items-end rounded-xl p-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(196,163,90,0.15)",
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
                  color: "#EDE8DF",
                  caretColor: "#C4A35A",
                  maxHeight: "100px",
                  lineHeight: "1.5",
                }}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background:
                    loading || !input.trim()
                      ? "rgba(200,168,90,0.1)"
                      : "linear-gradient(135deg, #c8a85a, #e8d8a0)",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={loading || !input.trim() ? "rgba(200,168,90,0.4)" : "#071030"}
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
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: open
            ? "#1C1916"
            : "linear-gradient(135deg, #c8a85a, #e8d8a0)",
          boxShadow: open
            ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,163,90,0.35)"
            : "0 8px 32px rgba(196,163,90,0.3), 0 0 0 1px rgba(196,163,90,0.3)",
          transform: open ? "scale(0.95)" : "scale(1)",
        }}
        aria-label={open ? "Cerrar chat" : "Abrir chat con Dani"}
      >
        {open ? (
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#e8d8a0" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#071030" strokeWidth={2}>
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
