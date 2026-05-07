"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="flex items-end gap-3 px-4 md:px-6"
    >
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 glow-sm">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="chat-bubble-ai rounded-2xl rounded-bl-sm px-4 py-3.5">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="typing-dot w-1.5 h-1.5 bg-indigo-400 rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
