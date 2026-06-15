import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/ChatInterface"

export default async function ChatPage() {
  const session = await auth()
  if (!session || session.user?.role !== "admin") redirect("/login")

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #3b82f6, #06b6d4)" }} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase" style={{ color: "#1d4ed8" }}>
            SYS://ASSISTANT
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: "#3b82f6", boxShadow: "0 0 6px rgba(59,130,246,0.8)" }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  )
}
