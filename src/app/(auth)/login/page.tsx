"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Login failed"); return; }
      login(data.user, data.token);
      toast.success("Welcome back!");
      router.push(["OWNER", "ADMIN", "SUPER_ADMIN"].includes(data.user.role) ? "/dashboard" : "/chat");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030305] flex overflow-hidden">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] animate-blob animate-delay-400" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">RestaurantAI</span>
          </Link>

          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-4">AI Restaurant Platform</p>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white mb-6">
                Your AI receptionist<br />
                <span className="gradient-text">never sleeps.</span>
              </h1>
              <p className="text-white/40 leading-relaxed max-w-md">
                Handle reservations, answer questions, capture leads, and send emails — all on autopilot while you focus on the food.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 space-y-3">
              {[
                "Connects to Google Drive in 1 click",
                "GPT-4o powered responses",
                "Auto-saves leads to Google Sheets",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>
                  <span className="text-sm text-white/50">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="text-white/20 text-xs">© {new Date().getFullYear()} RestaurantAI</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 lg:hidden mesh-bg" />
        <div className="absolute inset-0 lg:hidden dot-pattern opacity-30" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">RestaurantAI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-white/40 mt-1 text-sm">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Email</label>
              <input
                type="email" value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@restaurant.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} value={form.password} required
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={isLoading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl text-sm glow-btn transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading ? "Signing in..." : "Sign in"}
            </motion.button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            No account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
