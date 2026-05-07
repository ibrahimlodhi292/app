"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Bot, MessageSquare, Search, User } from "lucide-react";
import { format } from "date-fns";
import { type Conversation } from "@/types";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ id: string; role: string; content: string; createdAt: string }[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    async function fetchConversations() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data.data || []);
          setTotal(data.total || 0);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchConversations();
  }, []);

  async function loadMessages(conv: Conversation) {
    setSelected(conv);
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conv.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data?.messages || []);
      }
    } catch {
    } finally {
      setLoadingMessages(false);
    }
  }

  const filtered = conversations.filter(
    (c) => !search || (c.title || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-black text-white">Conversations</h1>
        <p className="text-white/35 mt-1 text-sm">{total} total conversations</p>
      </motion.div>

      <div className="flex-1 grid lg:grid-cols-[320px_1fr] gap-5 min-h-0">
        {/* Left: list */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
            />
          </div>

          <div className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex-1 space-y-px overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="w-32 h-3 bg-white/[0.06] rounded mb-1.5" />
                      <div className="w-20 h-2.5 bg-white/[0.04] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-white/20" />
                </div>
                <p className="text-sm text-white/30 font-medium">No conversations</p>
                <p className="text-xs text-white/15 mt-1">
                  {search ? "Try a different search" : "Conversations appear here as guests chat"}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-hidden divide-y divide-white/[0.04]">
                {filtered.map((conv, i) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => loadMessages(conv)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group ${
                      selected?.id === conv.id ? "bg-indigo-500/[0.08] border-l-2 border-indigo-500/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        selected?.id === conv.id ? "bg-indigo-500/30 text-indigo-300" : "bg-white/[0.06] text-white/40"
                      }`}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold truncate ${
                            selected?.id === conv.id ? "text-white" : "text-white/60 group-hover:text-white/80"
                          }`}>
                            {conv.title || "New Conversation"}
                          </p>
                          <span className="text-[10px] text-white/20 flex-shrink-0 tabular-nums">
                            {format(new Date(conv.updatedAt), "MMM d")}
                          </span>
                        </div>
                        {conv.isEscalated && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 rounded-full px-1.5 py-0.5 mt-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Escalated
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="px-5 py-4 border-b border-white/[0.05] flex-shrink-0">
                  <h2 className="font-bold text-white text-sm">{selected.title || "Conversation"}</h2>
                  <p className="text-xs text-white/25 mt-0.5">
                    {format(new Date(selected.createdAt), "MMM d, yyyy · h:mm a")}
                    {selected.isEscalated && (
                      <span className="ml-2 text-amber-400">· Escalated to staff</span>
                    )}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hidden p-5 space-y-3">
                  {loadingMessages ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
                          <div className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48 bg-indigo-500/10" : "w-64 bg-white/[0.04]"}`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mb-0.5">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-500/15 border border-indigo-500/20 text-white rounded-br-sm"
                            : "bg-white/[0.05] border border-white/[0.07] text-white/80 rounded-bl-sm"
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center px-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-sm font-medium text-white/30">Select a conversation</p>
                <p className="text-xs text-white/15 mt-1">Click any conversation to view the full transcript</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
