"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Copy, Check, User, ThumbsUp, ThumbsDown, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { type ChatMessage } from "@/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const isUser = message.role === "user";

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={`flex items-end gap-2.5 px-4 md:px-6 group ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.05 }}
        className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-violet-500/80 to-purple-600/80 border border-white/10"
            : "bg-gradient-to-br from-indigo-500 to-violet-600 glow-sm"
        }`}
      >
        {isUser
          ? <User className="w-3.5 h-3.5 text-white" />
          : <Bot className="w-3.5 h-3.5 text-white" />
        }
      </motion.div>

      {/* Content */}
      <div className={`max-w-[78%] sm:max-w-[68%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div className={`relative rounded-2xl px-4 py-3 ${
          isUser
            ? "chat-bubble-user text-white rounded-br-sm"
            : "chat-bubble-ai text-white/90 rounded-bl-sm"
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className={`flex items-center gap-1.5 px-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-white/15 tabular-nums">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>

          {!isUser && (
            <div className="flex items-center gap-0.5 msg-action">
              {/* Copy */}
              <button
                onClick={copy}
                title="Copy"
                className="flex items-center justify-center w-6 h-6 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06] transition-all"
              >
                {copied
                  ? <Check className="w-3 h-3 text-emerald-400" />
                  : <Copy className="w-3 h-3" />
                }
              </button>

              {/* Thumbs up */}
              <button
                onClick={() => setLiked(liked === "up" ? null : "up")}
                title="Good response"
                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all ${
                  liked === "up"
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-white/20 hover:text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
              </button>

              {/* Thumbs down */}
              <button
                onClick={() => setLiked(liked === "down" ? null : "down")}
                title="Poor response"
                className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all ${
                  liked === "down"
                    ? "text-red-400 bg-red-500/10"
                    : "text-white/20 hover:text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="flex items-center gap-1 msg-action">
              {message.sources.slice(0, 2).map((s, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-[10px] text-indigo-400/60 bg-indigo-500/[0.08] border border-indigo-500/15 rounded-full px-2 py-0.5 font-medium"
                >
                  <Sparkles className="w-2 h-2" />
                  {s.documentName.slice(0, 16)}
                </span>
              ))}
              {message.sources.length > 2 && (
                <span className="text-[10px] text-white/20">+{message.sources.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
