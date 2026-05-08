"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight, Bot, Calendar, BarChart3,
  Database, Mail, MessageSquare, Check,
  Sparkles, Users, Zap, Star, ChevronRight,
  Globe, Shield, Clock, Play, Menu, X,
  Layers, TrendingUp, Cpu, Lock, ChevronDown,
} from "lucide-react";

const easeOut = [0.22, 1, 0.36, 1];
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.6, ease: easeOut } }),
};

/* ── DATA ─────────────────────────────────── */
const stats = [
  { value: "500+", label: "Restaurants" },
  { value: "2M+", label: "Conversations" },
  { value: "< 800ms", label: "Response time" },
  { value: "99.9%", label: "Uptime" },
];

const features = [
  {
    icon: MessageSquare,
    title: "Instant AI Responses",
    body: "Guests get human-quality answers in under a second — reservations, menu, hours, specials, everything.",
    badge: "< 1s",
    color: "indigo",
    span: "md:col-span-2",
    demo: "chat",
  },
  {
    icon: Clock,
    title: "24/7 Online",
    body: "Never closes. Never gets tired. Your AI is live every hour of every day.",
    badge: "LIVE",
    color: "emerald",
    span: "md:col-span-1",
    demo: "uptime",
  },
  {
    icon: Database,
    title: "Google Drive RAG",
    body: "Upload menus, wine lists, FAQs — the AI reads them and answers accurately from your own docs.",
    badge: "RAG",
    color: "amber",
    span: "md:col-span-1",
    demo: "drive",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    body: "Track every conversation, lead, and booking in real time. Know exactly how your AI is performing.",
    badge: "Real-time",
    color: "violet",
    span: "md:col-span-2",
    demo: "analytics",
  },
];

const steps = [
  { num: "01", icon: Database, title: "Connect your Drive", body: "Upload your menu, FAQs, and policies. The AI learns your restaurant in minutes." },
  { num: "02", icon: Zap, title: "Go live instantly", body: "Add one script tag or use our API. No complex integration needed." },
  { num: "03", icon: Sparkles, title: "Watch it work", body: "Sit back while the AI books tables, captures leads, and delights every guest." },
];

const testimonials = [
  { name: "Marco R.", role: "Owner, La Bella Trattoria", text: "Reservations up 40% in the first month. The AI handles everything — I just check the dashboard.", avatar: "M", stars: 5, metric: "+40%" },
  { name: "Sarah K.", role: "GM, The Rooftop Lounge", text: "Guests think it's a real person. The responses are that good. Zero setup required after connect.", avatar: "S", stars: 5, metric: "5★" },
  { name: "James T.", role: "Owner, Harbor Grille", text: "Best investment I made this year. Pays for itself with one reservation saved per day.", avatar: "J", stars: 5, metric: "3× ROI" },
];

const integrations = [
  { name: "Google Drive", icon: "🗂️", desc: "Auto-sync menus & docs" },
  { name: "Google Sheets", icon: "📊", desc: "Export leads instantly" },
  { name: "OpenAI GPT-4o", icon: "🤖", desc: "State-of-the-art AI" },
  { name: "Resend Email", icon: "📧", desc: "Automated confirmations" },
  { name: "Pinecone", icon: "🌲", desc: "Vector knowledge search" },
  { name: "Prisma DB", icon: "🗄️", desc: "Type-safe database" },
];

const faqs = [
  { q: "How long does setup take?", a: "Under 5 minutes. Create an account, name your restaurant, and optionally connect Google Drive. Your AI is live immediately." },
  { q: "Do guests need to download anything?", a: "No. The chatbot is a simple iframe or script tag you embed on your website. Guests just type — no app, no login." },
  { q: "What if the AI doesn't know something?", a: "It will say so and offer to escalate to a human. You're always in control and get notified for any escalation." },
  { q: "Can I customize the AI's personality?", a: "Yes. In your dashboard Settings, you can write a custom system prompt, set a welcome message, and define your AI's tone." },
  { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. Each restaurant has fully isolated data. We never share your information." },
  { q: "What's the difference between Starter and Pro?", a: "Starter is free with 200 conversations/month. Pro gives unlimited conversations, Google Drive RAG, full analytics, reservation management, and priority support." },
];

const starterFeatures = [
  "200 AI conversations/month",
  "Basic Q&A responses",
  "Lead capture",
  "Email notifications",
  "1 restaurant",
];
const proFeatures = [
  "Unlimited conversations",
  "GPT-4o powered responses",
  "Google Drive knowledge base (RAG)",
  "Full analytics dashboard",
  "Reservation management",
  "Email automation (Resend)",
  "Priority support",
  "Custom AI personality",
  "Google Sheets integration",
  "Conversation history",
];

/* ── Mini demos ───────────────────────────── */
function ChatDemo() {
  const msgs = [
    { role: "user", text: "Book a table for 4 on Friday at 7pm" },
    { role: "ai", text: "✅ Done! Confirmation for Marco, Friday 7PM, party of 4.\nCode: CONF-A4X2" },
  ];
  return (
    <div className="space-y-3 mt-4">
      {msgs.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.3 }} viewport={{ once: true }}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
        >
          {m.role === "ai" && (
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-2.5 h-2.5 text-white" />
            </div>
          )}
          <div className={`text-[11px] px-3 py-2 rounded-2xl max-w-[220px] leading-snug whitespace-pre-wrap ${
            m.role === "user" ? "chat-bubble-user text-white rounded-br-sm" : "chat-bubble-ai text-white/80 rounded-bl-sm"
          }`}>{m.text}</div>
        </motion.div>
      ))}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Bot className="w-2.5 h-2.5 text-white" />
        </div>
        <div className="chat-bubble-ai px-3 py-2 rounded-2xl rounded-bl-sm">
          <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  const pts = [70,45,80,55,90,65,95,70,85,60,92,78];
  const max = Math.max(...pts);
  const h = 60, w = 220;
  const step = w / (pts.length - 1);
  const coords = pts.map((p, i) => `${i * step},${h - (p / max) * h}`).join(" ");
  return (
    <div className="mt-4">
      <div className="flex items-end gap-3 mb-3">
        <div className="text-3xl font-black text-white">256</div>
        <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-1 mb-1 font-medium">↑ 24%</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h+10}`} className="w-full opacity-80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={coords} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={`0,${h} ${coords} ${w},${h}`} fill="url(#ag)" />
      </svg>
      <div className="text-[10px] text-white/20 mt-1">conversations this month</div>
    </div>
  );
}

/* ── Navbar ───────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#030305]/90 backdrop-blur-xl border-b border-white/[0.04]" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-[1.5px] border-[#030305]" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-white">RestaurantAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {[["Features","#features"],["How It Works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]].map(([label, href]) => (
              <a key={label} href={href}
                className="text-[13px] text-white/40 hover:text-white transition-colors duration-200 font-medium">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-[13px] text-white/50 hover:text-white transition-colors font-medium px-3 py-2">
              Log in
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 bg-white text-black text-[13px] font-bold px-4 py-2 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10">
              Start free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-white/40 hover:text-white p-1">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl md:hidden">
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#0a0a14] border-l border-white/[0.07] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-white">RestaurantAI</span>
                <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-2 flex-1">
                {[["Features","#features"],["How It Works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]].map(([label, href]) => (
                  <a key={label} href={href} onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="space-y-3">
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm text-white/50 hover:text-white py-2 transition-colors">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="block text-center bg-white text-black font-bold text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-all">
                  Start for free
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── FAQ Item ─────────────────────────────── */
function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: i * 0.05, duration: 0.5, ease: easeOut }}
      className="border-b border-white/[0.06]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden"
          >
            <p className="text-[14px] text-white/40 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const [annual, setAnnual] = useState(false);
  const price = annual ? 39 : 49;

  return (
    <div className="min-h-screen bg-[#03030A] text-white overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 dot-pattern opacity-[0.35]" />
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-indigo-600/[0.07] blur-[140px] animate-blob" />
        <div className="absolute top-1/2 -right-60 w-[600px] h-[600px] rounded-full bg-violet-600/[0.06] blur-[120px] animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/[0.05] blur-[100px] animate-blob" style={{ animationDelay: "4s" }} />
      </div>

      <Navbar />

      {/* ── HERO ─────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 pt-32 pb-24 px-6 max-w-5xl mx-auto text-center"
      >
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 cursor-default"
        >
          <Sparkles className="w-3 h-3" />
          Powered by GPT-4o · streaming responses
          <span className="relative flex h-1.5 w-1.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="text-[52px] sm:text-7xl lg:text-[88px] font-black tracking-[-0.04em] leading-[0.95] mb-6"
        >
          <span className="text-white/25">The AI</span>
          <br />
          <span className="text-white">receptionist</span>
          <br />
          <span className="gradient-text">your restaurant</span>
          <br />
          <span className="gradient-text">deserves.</span>
        </motion.h1>

        <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
          className="text-base sm:text-lg text-white/35 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Handle reservations, answer every question, capture leads, and delight guests — automatically, around the clock. Connect in minutes.
        </motion.p>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
        >
          <Link href="/register"
            className="group flex items-center gap-2.5 bg-white text-black font-bold text-[15px] px-7 py-3.5 rounded-2xl hover:bg-white/92 active:scale-95 transition-all shadow-2xl shadow-white/10">
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/chat"
            className="flex items-center gap-2.5 glass border border-white/[0.08] hover:bg-white/[0.06] text-white/70 hover:text-white font-medium text-[14px] px-6 py-3.5 rounded-2xl transition-all">
            <Play className="w-4 h-4" />
            Try live demo
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
        >
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: easeOut }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl font-black gradient-text mb-1 tabular-nums">{s.value}</div>
              <div className="text-white/25 text-xs font-medium">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── PRODUCT MOCKUP ───────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.8, ease: easeOut }}
        className="relative z-10 max-w-4xl mx-auto px-6 mb-36"
      >
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-indigo-500/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#060610] shadow-2xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="border-beam-animated absolute inset-0 rounded-2xl" />
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-black/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1 text-[10px] text-white/20 mx-4 text-center">
              your-restaurant.com · AI Chat
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Online
            </div>
          </div>
          <div className="flex h-[340px] sm:h-[380px]">
            <div className="w-[180px] border-r border-white/[0.05] p-3 hidden sm:flex flex-col">
              <div className="flex items-center gap-2 p-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-white/70">RestaurantAI</span>
              </div>
              <div className="text-[9px] text-white/15 uppercase tracking-widest px-2 mb-1.5">Recent</div>
              {["Book for Friday","Menu questions","Dietary info"].map((t, i) => (
                <div key={t} className={`px-2 py-2 rounded-lg text-[10px] mb-0.5 ${i===0 ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-white/25"}`}>
                  {t}
                </div>
              ))}
              <div className="mt-auto flex items-center gap-1.5 px-2 py-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] text-white/20">AI Online</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden px-4 py-4 space-y-3 relative">
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#060610] to-transparent z-10 pointer-events-none" />
                {[
                  { user: true, text: "I'd like to book a table for 4 this Friday at 7pm 🍽️", delay: 0.2 },
                  { user: false, text: "Perfect! 🎉 I have availability for <strong>Friday at 7:00 PM</strong> for a party of 4. Could I get your name?", delay: 0.5 },
                  { user: true, text: "Marco Rossi", delay: 0.8 },
                ].map((msg, i) => (
                  <motion.div key={i} className={`flex items-end gap-2 ${msg.user ? "justify-end" : ""}`}
                    initial={{ opacity: 0, x: msg.user ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: msg.delay }} viewport={{ once: true }}>
                    {!msg.user && (
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`text-[12px] px-3.5 py-2.5 rounded-2xl max-w-[230px] leading-snug ${
                      msg.user ? "chat-bubble-user text-white rounded-br-sm" : "chat-bubble-ai text-white/80 rounded-bl-sm"
                    }`} dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </motion.div>
                ))}
                <motion.div className="flex items-end gap-2" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }} viewport={{ once: true }}>
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="chat-bubble-ai text-[11px] text-white/80 px-3.5 py-3 rounded-2xl rounded-bl-sm max-w-[230px]">
                    <div className="font-semibold text-white mb-1.5">✅ Booking confirmed, Marco!</div>
                    <div className="bg-indigo-500/10 border border-indigo-500/15 rounded-lg p-2 space-y-1">
                      {[["Date","Friday, Jan 10"],["Time","7:00 PM"],["Guests","4"],["Code","CONF-A4X2"]].map(([k,v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="text-white/40">{k}</span>
                          <span className={k==="Code"?"font-mono text-indigo-300":"text-white/80"}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="p-3 border-t border-white/[0.05]">
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2">
                  <input readOnly placeholder="Ask anything…" className="flex-1 bg-transparent text-[11px] text-white/30 placeholder:text-white/20 outline-none" />
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── BENTO FEATURES ─────────────────── */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }} className="text-center mb-14"
        >
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-4">One platform, fully automated</h2>
          <p className="text-white/30 max-w-md mx-auto text-[15px]">No 10-tool stack. No integrations to maintain. One AI that runs your front-of-house.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat — spans 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0, duration: 0.6, ease: easeOut }}
            className="bento-card md:col-span-2 p-6 relative overflow-hidden"
            style={{ background: "radial-gradient(circle at 0% 0%, rgba(99,102,241,0.08), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-white text-[15px]">Instant AI Responses</h3>
              <span className="badge-indigo text-[10px] font-bold px-2 py-0.5 rounded-full">&lt; 1s</span>
            </div>
            <p className="text-[13px] text-white/35 mb-1">Guests get human-quality answers instantly — menus, hours, reservations, anything.</p>
            <ChatDemo />
          </motion.div>

          {/* Always On */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.6, ease: easeOut }}
            className="bento-card p-6 flex flex-col justify-between"
            style={{ background: "radial-gradient(circle at 100% 0%, rgba(16,185,129,0.07), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-xs text-emerald-400 font-semibold">Always online</span>
              </div>
              <div className="text-6xl font-black text-white mb-2 tracking-tighter">24/7</div>
              <h3 className="font-bold text-white text-[15px] mb-1">Never closes</h3>
              <p className="text-[13px] text-white/35">Midnight questions, holiday reservations — handled automatically.</p>
            </div>
            <div className="flex gap-1 mt-4">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="text-[8px] text-white/20 mb-1">{d}</div>
                  <div className="h-8 rounded bg-emerald-500/20 border border-emerald-500/20" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Drive */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6, ease: easeOut }}
            className="bento-card p-6"
            style={{ background: "radial-gradient(circle at 0% 100%, rgba(245,158,11,0.07), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>RAG</span>
            </div>
            <h3 className="font-bold text-white text-[15px] mb-1">Google Drive RAG</h3>
            <p className="text-[13px] text-white/35 mb-4">Upload your menu and FAQs once. The AI reads and answers from your own docs.</p>
            <div className="space-y-2">
              {["menu_2024.pdf","wine_list.docx","faq.txt"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[11px]">
                  <div className="w-5 h-5 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <span className="text-[7px] text-white/40">PDF</span>
                  </div>
                  <span className="text-white/40 font-mono">{f}</span>
                  <span className="ml-auto text-emerald-400 text-[10px]">✓</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Analytics — spans 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: easeOut }}
            className="bento-card md:col-span-2 p-6"
            style={{ background: "radial-gradient(circle at 100% 100%, rgba(139,92,246,0.08), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-white text-[15px]">Live Analytics</h3>
              <span className="text-[10px] text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 font-semibold">Real-time</span>
            </div>
            <p className="text-[13px] text-white/35 mb-1">Track conversations, leads, and bookings in real time.</p>
            <AnalyticsDemo />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────── */}
      <section id="how-it-works" className="relative z-10 px-6 py-24 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center mb-16"
        >
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em]">Live in 5 minutes</h2>
        </motion.div>
        <div className="relative grid md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-px gradient-separator" />
          {steps.map((step, i) => (
            <motion.div key={step.num}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: easeOut }}
              className="text-center relative"
            >
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] flex items-center justify-center mb-5 mx-auto">
                  <step.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="absolute -top-2 -right-2 text-[10px] font-black text-indigo-400 bg-indigo-500/15 border border-indigo-500/25 rounded-full w-6 h-6 flex items-center justify-center">
                  {step.num.slice(-1)}
                </div>
              </div>
              <h3 className="font-bold text-white text-[15px] mb-2">{step.title}</h3>
              <p className="text-[13px] text-white/35 leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INTEGRATIONS ────────────────────── */}
      <section className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center mb-12"
        >
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Integrations</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-4">Built on best-in-class tools</h2>
          <p className="text-white/30 text-[15px]">Every component chosen for reliability, speed, and developer experience.</p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {integrations.map((int, i) => (
            <motion.div key={int.name}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: easeOut }}
              className="bento-card p-5 flex items-center gap-4"
            >
              <div className="text-3xl flex-shrink-0">{int.icon}</div>
              <div>
                <p className="text-sm font-semibold text-white">{int.name}</p>
                <p className="text-[11px] text-white/30">{int.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────── */}
      <section className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em]">Loved by restaurant owners</h2>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: easeOut }}
              className="bento-card p-6 relative"
            >
              <div className="absolute top-4 right-4 text-lg font-black text-emerald-400/50">{t.metric}</div>
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-[13px] text-white/55 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-white/25">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 py-24 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center mb-12"
        >
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-8">Simple, honest pricing</h2>
          <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1.5">
            {["Monthly","Annual"].map((period) => (
              <button key={period} onClick={() => setAnnual(period === "Annual")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  (period === "Annual") === annual ? "bg-white text-black" : "text-white/40 hover:text-white/70"
                }`}
              >
                {period}
                {period === "Annual" && <span className="ml-2 text-[10px] text-emerald-400 font-bold">-20%</span>}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOut }} className="bento-card p-7"
          >
            <div className="mb-6">
              <h3 className="font-bold text-white text-lg mb-1">Starter</h3>
              <p className="text-white/30 text-sm">For testing and small restaurants</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-black text-white">$0</span>
                <span className="text-white/30 text-sm mb-2">/ month</span>
              </div>
            </div>
            <Link href="/register"
              className="block text-center text-sm font-semibold bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white/80 hover:text-white px-5 py-3 rounded-xl mb-6 transition-all">
              Get started for free
            </Link>
            <ul className="space-y-3">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/50">
                  <Check className="w-4 h-4 text-white/25 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOut }} className="pricing-popular rounded-2xl p-7 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-[10px] font-black text-white bg-indigo-500 px-2.5 py-1 rounded-full">Most Popular</div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />
            <div className="mb-6">
              <h3 className="font-bold text-white text-lg mb-1">Pro</h3>
              <p className="text-white/30 text-sm">For serious restaurant owners</p>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-black text-white">${price}</span>
                <span className="text-white/30 text-sm mb-2">/ month</span>
                {annual && <span className="text-[11px] text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5 mb-2 font-semibold">billed annually</span>}
              </div>
            </div>
            <Link href="/register"
              className="block text-center text-[14px] font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-3 rounded-xl mb-6 transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-indigo-500/25">
              Start 14-day free trial
            </Link>
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/70">
                  <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────── */}
      <section id="faq" className="relative z-10 px-6 py-24 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }} className="text-center mb-12"
        >
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em]">Common questions</h2>
        </motion.div>
        <div>
          {faqs.map((faq, i) => <FAQItem key={faq.q} q={faq.q} a={faq.a} i={i} />)}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────── */}
      <section className="relative z-10 px-6 py-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="relative p-12 sm:p-16 rounded-3xl overflow-hidden text-center"
          style={{ background: "linear-gradient(145deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05), rgba(236,72,153,0.04))", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px]" />
          <div className="relative">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 glow-indigo"
            >
              <Zap className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-4">Start in 5 minutes</h2>
            <p className="text-white/35 text-[15px] mb-8 max-w-sm mx-auto leading-relaxed">
              Connect your Drive, set your hours, and your AI receptionist is live before your next service.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-3 bg-white text-black font-bold text-[15px] px-8 py-4 rounded-2xl hover:bg-white/92 active:scale-95 transition-all shadow-2xl shadow-white/10">
              <Sparkles className="w-5 h-5" />
              Get started for free
            </Link>
            <p className="text-white/20 text-[11px] mt-4">No credit card · 14-day trial · Cancel anytime</p>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-white/60">RestaurantAI</span>
            </div>
            <div className="flex items-center gap-8">
              {[["Features","#features"],["Pricing","#pricing"],["FAQ","#faq"],["Dashboard","/dashboard"],["Chat","/chat"]].map(([label, href]) => (
                <a key={label} href={href} className="text-[12px] text-white/25 hover:text-white/60 transition-colors">{label}</a>
              ))}
            </div>
            <p className="text-white/15 text-[11px]">© {new Date().getFullYear()} RestaurantAI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
