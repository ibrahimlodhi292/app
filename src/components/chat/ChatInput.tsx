"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Mic, Paperclip, X } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

const QUICK_PROMPTS = [
  { emoji: "📅", text: "Book a table" },
  { emoji: "🍽️", text: "See the menu" },
  { emoji: "🕐", text: "Opening hours" },
  { emoji: "🥗", text: "Dietary options" },
];

export function ChatInput({ onSend, isLoading, placeholder, disabled }: {
  onSend: (msg: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim() && !isLoading && !disabled;

  function send() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function onInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function toggleRecording() {
    setIsRecording((r) => !r);
    if (!isRecording) {
      setTimeout(() => setIsRecording(false), 4000);
    }
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto w-full">
      {/* Quick prompts */}
      <AnimatePresence>
        {!value && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {QUICK_PROMPTS.map((p) => (
              <motion.button
                key={p.text}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setValue(p.text); textareaRef.current?.focus(); }}
                className="flex items-center gap-1.5 text-xs text-white/35 bg-white/[0.04] border border-white/[0.07] rounded-full px-3 py-1.5 hover:bg-white/[0.07] hover:text-white/60 hover:border-white/[0.12] transition-all duration-200"
              >
                <span>{p.emoji}</span>
                <span>{p.text}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording state */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            className="flex items-center justify-center gap-3 py-2"
          >
            <div className="flex items-end gap-0.5 h-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-indigo-400 rounded-full voice-bar"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-indigo-400 font-medium">Listening...</span>
            <button
              onClick={() => setIsRecording(false)}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <motion.div
        animate={{
          boxShadow: value
            ? "0 0 0 1.5px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.3)"
            : "none",
        }}
        className={`relative rounded-2xl transition-all duration-300 ${
          value
            ? "bg-white/[0.05] border border-white/[0.12]"
            : "bg-white/[0.03] border border-white/[0.06]"
        } focus-within:border-indigo-500/35 focus-within:bg-white/[0.05]`}
      >
        {/* Attachment button */}
        <div className="absolute left-3 bottom-3 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={disabled || isLoading}
            title="Attach file"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-all disabled:opacity-30"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder={isRecording ? "" : (placeholder || "Ask anything about the restaurant…")}
          disabled={disabled || isLoading || isRecording}
          rows={1}
          className="w-full bg-transparent text-white/90 placeholder:text-white/20 text-sm pl-12 pr-[88px] py-3.5 resize-none focus:outline-none max-h-40 scrollbar-hidden leading-relaxed"
        />

        {/* Right-side buttons */}
        <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
          {/* Voice button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRecording}
            disabled={disabled || isLoading}
            title={isRecording ? "Stop recording" : "Voice input"}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all disabled:opacity-30 ${
              isRecording
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-white/20 hover:text-white/50 hover:bg-white/[0.06]"
            }`}
          >
            <Mic className={`w-3.5 h-3.5 ${isRecording ? "text-indigo-400" : ""}`} />
          </motion.button>

          {/* Send button */}
          <motion.button
            onClick={send}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.08 } : {}}
            whileTap={canSend ? { scale: 0.92 } : {}}
            className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all duration-200 ${
              canSend
                ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-white/[0.06] text-white/20 cursor-not-allowed"
            }`}
          >
            {isLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ArrowUp className="w-3.5 h-3.5" />
            }
          </motion.button>
        </div>
      </motion.div>

      {/* Hint */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-white/15">
        <span>Press <kbd>↵</kbd> to send</span>
        <span>·</span>
        <span><kbd>⇧</kbd><kbd>↵</kbd> for new line</span>
        <span>·</span>
        <span>AI may make mistakes</span>
      </div>
    </div>
  );
}
