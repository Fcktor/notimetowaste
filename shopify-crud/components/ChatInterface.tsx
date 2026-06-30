"use client"
import { useRef, useState, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hola, soy **ARIA** — tu asistente de administración para No Time To Waste.\n\nPuedo consultarte sobre:\n- Inventario y stock de relojes\n- Colecciones automáticas\n- Filtros por marca, estilo, movimiento, género...\n\n¿En qué puedo ayudarte hoy?",
}

function AssistantText({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("- ")) {
          return (
            <div key={i} className="flex gap-2">
              <span style={{ color: "#C4A35A" }}>•</span>
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
      <strong key={i} style={{ color: "#C4A35A" }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: "user", content: text }
    // Strip the local-only welcome message before sending to the API
    const conversationHistory = messages[0] === WELCOME
      ? [userMsg]
      : [...messages, userMsg]

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      })
      const data = await res.json()
      const reply = data.reply ?? data.error ?? "No se pudo obtener respuesta."
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
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden relative"
      style={{
        background: "rgba(15,14,12,0.95)",
        border: "1px solid rgba(196,163,90,0.15)",
        boxShadow: "0 0 40px rgba(0,0,0,0.6), inset 0 0 40px rgba(196,163,90,0.02)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{
          background: "rgba(12,11,9,0.9)",
          borderBottom: "1px solid rgba(196,163,90,0.12)",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(196,163,90,0.1)",
            border: "1px solid rgba(196,163,90,0.3)",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#C4A35A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: "#C4A35A" }}
            >
              ARIA
            </span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(196,163,90,0.1)", color: "#C4A35A", border: "1px solid rgba(196,163,90,0.2)" }}
            >
              ONLINE
            </span>
          </div>
          <p className="text-[10px] font-mono" style={{ color: "rgba(196,163,90,0.5)" }}>
            Asistente de Administración · NTTW
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div key={i} className="flex gap-3 max-w-[85%]">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: "rgba(196,163,90,0.1)",
                  border: "1px solid rgba(196,163,90,0.25)",
                }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#C4A35A" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div
                className="rounded-xl px-4 py-3 text-sm leading-relaxed"
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
                className="rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[75%]"
                style={{
                  background: "rgba(196,163,90,0.3)",
                  border: "1px solid rgba(196,163,90,0.25)",
                  color: "#EDE8DF",
                }}
              >
                {msg.content}
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(196,163,90,0.1)",
                border: "1px solid rgba(196,163,90,0.25)",
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#C4A35A" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(196,163,90,0.06)",
                border: "1px solid rgba(196,163,90,0.12)",
              }}
            >
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(j => (
                  <span
                    key={j}
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                      background: "#C4A35A",
                      animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
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
        className="flex-shrink-0 px-4 py-4"
        style={{ borderTop: "1px solid rgba(196,163,90,0.1)", background: "rgba(12,11,9,0.9)" }}
      >
        <div
          className="flex gap-3 items-end rounded-xl p-2"
          style={{
            background: "rgba(28,25,22,0.8)",
            border: "1px solid rgba(196,163,90,0.15)",
            boxShadow: "0 0 20px rgba(196,163,90,0.05)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Pregunta sobre el inventario, colecciones, stock..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-2 px-2"
            style={{
              color: "#EDE8DF",
              caretColor: "#C4A35A",
              maxHeight: "120px",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background:
                loading || !input.trim()
                  ? "rgba(196,163,90,0.1)"
                  : "#C4A35A",
              boxShadow:
                loading || !input.trim() ? "none" : "0 0 16px rgba(196,163,90,0.4)",
              border: "1px solid rgba(196,163,90,0.2)",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={loading || !input.trim() ? "#C4A35A" : "#0C0B09"} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] font-mono mt-2 text-center" style={{ color: "rgba(196,163,90,0.5)" }}>
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
