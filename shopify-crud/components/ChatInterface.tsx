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
        background: "#FFFFFF",
        border: "1px solid #EAEAEA",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{
          background: "#F9F9F8",
          borderBottom: "1px solid #EAEAEA",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "#F1F0ED",
            border: "1px solid #EAEAEA",
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#111111" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: "#2F3437" }}
            >
              ARIA
            </span>
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
              style={{ background: "#F1F0ED", color: "#787774", border: "1px solid #EAEAEA" }}
            >
              ONLINE
            </span>
          </div>
          <p className="text-[10px] font-mono" style={{ color: "#787774" }}>
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
                  background: "#111111",
                  border: "1px solid #111111",
                }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div
                className="rounded-xl px-4 py-3 text-sm leading-relaxed"
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
                className="rounded-xl px-4 py-3 text-sm leading-relaxed max-w-[75%]"
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
          <div className="flex gap-3 max-w-[85%]">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "#111111",
                border: "1px solid #111111",
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "#F1F0ED",
                border: "1px solid #EAEAEA",
              }}
            >
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map(j => (
                  <span
                    key={j}
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                      background: "#787774",
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
        style={{ borderTop: "1px solid #EAEAEA", background: "#FFFFFF" }}
      >
        <div
          className="flex gap-3 items-end rounded-xl p-2"
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
            placeholder="Pregunta sobre el inventario, colecciones, stock..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-2 px-2"
            style={{
              color: "#2F3437",
              caretColor: "#111111",
              maxHeight: "120px",
              lineHeight: "1.5",
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-[0.98] ${
              loading || !input.trim() ? "bg-[#EAEAEA]" : "bg-[#111111] hover:bg-[#333333]"
            }`}
            style={{
              border: "1px solid #EAEAEA",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={loading || !input.trim() ? "#787774" : "#FFFFFF"} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] font-mono mt-2 text-center" style={{ color: "#787774" }}>
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
