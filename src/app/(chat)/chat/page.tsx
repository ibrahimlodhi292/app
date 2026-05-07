"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "ai/react";
import { Menu, Settings, LogOut, ChevronDown, Bot, Sparkles, Zap, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { type ChatMessage } from "@/types";

const WELCOME_PROMPTS = [
  { icon: "📅", title: "Make a reservation", desc: "Book a table for any date" },
  { icon: "🍽️", title: "Explore the menu", desc: "Dishes & daily specials" },
  { icon: "🌿", title: "Dietary needs", desc: "Vegan, gluten-free & more" },
  { icon: "📍", title: "Find us", desc: "Location, hours & parking" },
];

export default function ChatPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { conversations, activeConversationId, setActiveConversation } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const restaurantId = user?.restaurantId || "";
  const restaurantName = user?.restaurant?.name || "Restaurant AI";

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: "/api/chat",
    body: { restaurantId, conversationId },
    onResponse: (res) => {
      const id = res.headers.get("x-conversation-id");
      if (id && !conversationId) { setConversationId(id); setActiveConversation(id); }
    },
    onError: () => toast.error("Message failed. Please try again."),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleNewConversation() {
    setConversationId(undefined);
    setActiveConversation(null);
    setMessages([]);
    setSidebarOpen(false);
  }

  function sendMessage(msg: string) {
    setInput(msg);
    setTimeout(() => {
      document.getElementById("chat-form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }, 10);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  }

  const chatMessages: ChatMessage[] = messages.map((m) => ({
    id: m.id, role: m.role as "user" | "assistant",
    content: m.content, createdAt: new Date(), sources: [],
  }));

  const isWelcome = messages.length === 0;

  return (
    <div className="flex h-screen bg-[#03030A] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-bg opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/[0.04] blur-[100px] rounded-full" />
      </div>

      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelectConversation={(id) => { setConversationId(id); setActiveConversation(id); setSidebarOpen(false); }}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] bg-[#03030A]/80 backdrop-blur-xl relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/70 hover:bg-white/[0.06] rounded-xl transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-[1.5px] border-[#03030A]" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white/80 leading-none">{restaurantName}</p>
                <p className="text-[10px] text-white/25 mt-0.5">AI Assistant</p>
              </div>
            </div>

            {/* Model badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-500/[0.08] border border-indigo-500/20 rounded-full px-2.5 py-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] text-indigo-400 font-semibold">GPT-4o</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online status */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/[0.07] border border-emerald-500/15 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Online</span>
            </div>

            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] rounded-xl px-3 py-1.5 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block text-xs text-white/60">{user.name?.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-white/30" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-2 w-44 bg-[#0c0c14] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                    >
                      {["OWNER", "ADMIN", "SUPER_ADMIN"].includes(user.role) && (
                        <button
                          onClick={() => { router.push("/dashboard"); setMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-white/55 hover:text-white hover:bg-white/[0.05] transition-all"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.05] transition-all border-t border-white/[0.05]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden relative">
          <AnimatePresence mode="wait">
            {isWelcome ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-full text-center px-6 py-12"
              >
                {/* Floating bot icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  className="relative mb-7"
                >
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-indigo shadow-2xl shadow-indigo-500/30 animate-float">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-400 border-2 border-[#03030A] flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>

                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-8"
                >
                  <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.02em] text-white mb-3">
                    Welcome to {restaurantName}
                  </h2>
                  <p className="text-white/30 text-[15px] max-w-sm mx-auto leading-relaxed">
                    Ask me anything — reservations, menu items, hours, specials, and more.
                  </p>
                </motion.div>

                {/* Prompt cards */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-2 gap-3 max-w-md w-full"
                >
                  {WELCOME_PROMPTS.map((p, i) => (
                    <motion.button
                      key={p.title}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.06 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendMessage(p.title)}
                      className="flex flex-col items-start gap-2 p-4 bento-card text-left hover:border-indigo-500/20 transition-all group"
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <div>
                        <span className="text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors block">{p.title}</span>
                        <span className="text-[11px] text-white/25 mt-0.5 block">{p.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Bottom hint */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex items-center gap-2 text-[11px] text-white/15"
                >
                  <Zap className="w-3 h-3" />
                  <span>Powered by GPT-4o · Streaming responses</span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 space-y-4 pb-4"
              >
                {chatMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 p-4 border-t border-white/[0.04] bg-[#03030A]/80 backdrop-blur-xl relative z-10">
          <form id="chat-form" onSubmit={handleSubmit}>
            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              disabled={!restaurantId}
            />
          </form>
        </div>
      </div>

      {/* Menu backdrop */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
