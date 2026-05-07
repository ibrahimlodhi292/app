"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bot, Eye, EyeOff, Loader2, ArrowRight, Building2, User, Mail, Lock, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const steps = [
  { id: 1, label: "Your info" },
  { id: 2, label: "Restaurant" },
  { id: 3, label: "Done" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", restaurantName: "" });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (form.password.length < 8) { toast.error("Password must be 8+ characters"); return; }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Registration failed"); return; }
      login(data.user, data.token);
      setStep(3);
      setTimeout(() => { toast.success("Welcome to RestaurantAI! 🎉"); router.push("/dashboard"); }, 1200);
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
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600/12 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] animate-blob animate-delay-400" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white">RestaurantAI</span>
          </Link>

          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white mb-4">
                Set up in<br />
                <span className="gradient-text">5 minutes.</span>
              </h1>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                Create your account, connect Google Drive, and your AI restaurant assistant is live immediately.
              </p>
            </motion.div>

            {/* Steps */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="mt-10 space-y-3">
              {[
                { n: "1", t: "Create your account", d: "Name, email, secure password" },
                { n: "2", t: "Name your restaurant", d: "Your AI gets a custom personality" },
                { n: "3", t: "Connect & go live", d: "Link Drive, Sheets, and email" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-indigo-500 text-white" : "bg-white/10 text-white/40"}`}>
                    {step > i + 1 ? <Check className="w-3 h-3" /> : item.n}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step === i + 1 ? "text-white" : "text-white/40"}`}>{item.t}</p>
                    <p className="text-xs text-white/25">{item.d}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          <p className="text-white/20 text-xs">Free forever on the Starter plan.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute inset-0 lg:hidden mesh-bg" />
        <div className="absolute inset-0 lg:hidden dot-pattern opacity-30" />

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
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

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium transition-all ${step >= s.id ? "text-white" : "text-white/25"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step > s.id ? "bg-emerald-500" : step === s.id ? "bg-indigo-500" : "bg-white/10"}`}>
                    {step > s.id ? <Check className="w-3 h-3 text-white" /> : s.id}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px w-8 transition-all ${step > s.id ? "bg-indigo-500/50" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          {step === 3 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-black text-white mb-2">You&apos;re in!</h2>
              <p className="text-white/40 text-sm">Taking you to your dashboard...</p>
              <div className="mt-4 flex items-center justify-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {step === 1 ? "Create your account" : "Your restaurant"}
                </h2>
                <p className="text-white/40 mt-1 text-sm">
                  {step === 1 ? "Free forever. No credit card needed." : "Almost done — name your AI assistant's home."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <InputField icon={User} label="Full name" type="text" value={form.name}
                      onChange={(v) => update("name", v)} placeholder="Marco Rossi" required />
                    <InputField icon={Mail} label="Email" type="email" value={form.email}
                      onChange={(v) => update("email", v)} placeholder="marco@restaurant.com" required />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/50 uppercase tracking-wide">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type={showPassword ? "text" : "password"} value={form.password} required minLength={8}
                          onChange={(e) => update("password", e.target.value)} placeholder="Min. 8 characters"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <InputField icon={Building2} label="Restaurant name" type="text" value={form.restaurantName}
                    onChange={(v) => update("restaurantName", v)} placeholder="La Bella Trattoria" required />
                )}

                <motion.button
                  type="submit" disabled={isLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl text-sm glow-btn transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {isLoading ? "Creating..." : step === 1 ? "Continue" : "Create account"}
                </motion.button>

                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)}
                    className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors py-1">
                    ← Back
                  </button>
                )}
              </form>

              <p className="text-center text-white/30 text-sm mt-6">
                Have an account?{" "}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, type, value, onChange, placeholder, required }: {
  icon: React.ElementType; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all" />
      </div>
    </div>
  );
}
