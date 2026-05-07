"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, Plus, Search, X, Sparkles, Clock } from "lucide-react";
import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { type Conversation } from "@/types";
import Link from "next/link";

function timeLabel(date: Date) {
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function ConversationSidebar({ conversations, activeId, onSelectConversation, onNewConversation, isOpen, onClose }: {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    (c.title || "New Chat").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = {
    today: filtered.filter((c) => isToday(new Date(c.updatedAt))),
    yesterday: filtered.filter((c) => isYesterday(new Date(c.updatedAt))),
    older: filtered.filter((c) => !isToday(new Date(c.updatedAt)) && !isYesterday(new Date(c.updatedAt))),
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden" />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 38 }}
        className="fixed md:relative md:translate-x-0 z-30 h-full w-72 flex flex-col bg-[#060608] border-r border-white/[0.05]"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:glow-sm transition-all">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm text-white">RestaurantAI</span>
            </Link>
            <button onClick={onClose} className="md:hidden text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500/15 to-violet-500/10 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 hover:border-indigo-500/35 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New conversation
          </motion.button>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-8 pr-4 py-2 text-xs text-white/60 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/30 focus:bg-white/[0.05] transition-all" />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden px-2 pb-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/30 text-sm font-medium">No conversations</p>
              <p className="text-white/15 text-xs mt-1">Start a new chat above</p>
            </div>
          ) : (
            <>
              {[
                { label: "Today", items: grouped.today },
                { label: "Yesterday", items: grouped.yesterday },
                { label: "Earlier", items: grouped.older },
              ].map(({ label, items }) => items.length > 0 && (
                <div key={label}>
                  <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest px-3 py-1">{label}</p>
                  <AnimatePresence>
                    {items.map((conv, i) => (
                      <motion.button key={conv.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 group ${
                          activeId === conv.id
                            ? "nav-active"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium truncate leading-relaxed ${
                            activeId === conv.id ? "text-white" : "text-white/55"
                          }`}>
                            {conv.title || "New Conversation"}
                          </p>
                          <span className="text-[9px] text-white/20 flex-shrink-0 mt-0.5 tabular-nums">
                            {timeLabel(new Date(conv.updatedAt))}
                          </span>
                        </div>
                        {conv.isEscalated && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-amber-400/80 bg-amber-500/10 rounded-full px-1.5 py-0.5 mt-1">
                            <span className="w-1 h-1 bg-amber-400 rounded-full" />
                            Escalated
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/25">AI Online</span>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
