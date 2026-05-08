"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight, Bot, Calendar, BarChart3, Database, MessageSquare,
  Check, Sparkles, Zap, Star, Play, Menu, X, CheckCircle2,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

/* ─── Data ───────────────────────────────────────────── */

const STATS = [
  { value: "500+", label: "Restaurants" },
  { value: "2M+", label: "Conversations" },
  { value: "< 800ms", label: "Avg response" },
  { value: "99.9%", label: "Uptime" },
];

const RESTAURANTS = [
  "La Bella Trattoria", "Harbor Grille", "The Rooftop Lounge", "Sakura Garden",
  "Casa Moderna", "Blue Fin Sushi", "The Oak Room", "Petra Mediterranean",
  "Ember & Ash", "Café Lumière", "Stone & Salt", "Verde Kitchen",
  "La Maison", "The Golden Fork", "Coastal Kitchen", "Nomad Bistro",
];

const FEATURES = [
  {
    id: "chat", icon: MessageSquare, label: "Instant AI Chat",
    title: "Every question. Answered instantly.",
    desc: "Guests get human-quality responses in under a second — menu, hours, specials, dietary needs, directions. In any language. Around the clock.",
    badge: "< 1s", badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  },
  {
    id: "reservations", icon: Calendar, label: "Smart Reservations",
    title: "Books tables without lifting a finger.",
    desc: "Collects guest info, checks availability, creates the booking, and sends a confirmation email — entirely inside one natural conversation with zero human involvement.",
    badge: "Automated", badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/25",
  },
  {
    id: "analytics", icon: BarChart3, label: "Live Analytics",
    title: "Know exactly what's working.",
    desc: "Real-time dashboards track every conversation, lead, and reservation. Understand what guests ask most and measure your AI's direct business impact.",
    badge: "Real-time", badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  {
    id: "knowledge", icon: Database, label: "Knowledge Base",
    title: "Your menu inside the AI's brain.",
    desc: "Upload menus, wine lists, FAQs to Google Drive. The AI reads and answers accurately from your own documents using retrieval-augmented generation.",
    badge: "RAG", badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  },
];

const STEPS = [
  { n: "01", title: "Create your account", body: "Register in 60 seconds. Name your restaurant, set your timezone, and write the AI's personality in plain English." },
  { n: "02", title: "Upload your knowledge", body: "Connect Google Drive. The AI ingests your menu, FAQs, and policies instantly — and always reflects your latest version." },
  { n: "03", title: "Go live", body: "Embed one script tag on your site. Guests start chatting immediately. Reservations and leads appear in your dashboard in real time." },
];

const TESTIMONIALS = [
  { quote: "We were spending 4 hours a day answering the same phone questions. RestaurantAI handles all of it now. The team focuses on the actual dining experience.", author: "Marco Ricci", role: "Owner · La Bella Trattoria, NYC", avatar: "M", metric: "+40%", mLabel: "reservations" },
  { quote: "The AI knows our full menu, wine pairings, allergen info — everything. Guests genuinely think it's a real person. The quality surprised even us.", author: "Sarah Kim", role: "GM · The Rooftop Lounge, LA", avatar: "S", metric: "5.0★", mLabel: "guest rating" },
  { quote: "ROI in week one. One saved no-show per day covers the entire cost. The lead capture feature alone is worth ten times what we pay.", author: "James Torres", role: "Owner · Harbor Grille, Miami", avatar: "J", metric: "3×", mLabel: "return" },
];

const FAQS = [
  { q: "How long does setup take?", a: "Under 5 minutes. Create your account, name your restaurant, and your AI is live immediately. Connecting Google Drive for the knowledge base takes 2 more minutes." },
  { q: "Do guests need to download anything?", a: "No. The chatbot embeds on your website via a script tag or iframe. Guests just type — no app, no login required." },
  { q: "What if the AI doesn't know something?", a: "It gracefully says so and offers to escalate to a human. You receive an instant notification so you can follow up directly." },
  { q: "Can I customize the AI's personality?", a: "Yes. In your Settings dashboard you can write a full system prompt, define the tone, set a welcome message, and restrict topics." },
  { q: "Is my data secure and isolated?", a: "Yes. Every restaurant has fully isolated data in its own namespace. All data is encrypted in transit and at rest. We never train on your data." },
  { q: "What's the difference between Starter and Pro?", a: "Starter is free with 200 conversations/month. Pro adds unlimited conversations, Google Drive RAG, full analytics, reservation management, email automation, and priority support." },
];

const STARTER = ["200 AI conversations/month", "Basic Q&A responses", "Lead capture", "Email notifications", "1 restaurant location"];
const PRO = ["Unlimited conversations", "GPT-4o powered responses", "Google Drive knowledge base (RAG)", "Full analytics dashboard", "Reservation management", "Email automation (Resend)", "Google Sheets lead export", "Custom AI personality", "Conversation history", "Priority support"];

/* ─── Feature Preview Components ─────────────────────── */

function ChatPreview() {
  const msgs = [
    { role: "user", text: "I'd like to book a table for 4 this Saturday at 7:30pm" },
    { role: "ai", text: "I'd love to help! I have availability for <strong>Saturday at 7:30 PM</strong> for a party of 4. Could I get your name?" },
    { role: "user", text: "Marco Rossi" },
    { role: "ai", isCard: true },
  ] as const;

  return (
    <div className="p-5 space-y-3.5">
      {msgs.map((m, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.22, ease }}
          className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "items-start"}`}
        >
          {m.role === "ai" && (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/25">
              <Bot className="w-3 h-3 text-white" />
            </div>
          )}
          <div className="max-w-[80%]">
            {m.role === "user" && (
              <div className="chat-bubble-user text-white text-[12px] px-3.5 py-2.5 rounded-2xl rounded-br-sm leading-relaxed">
                {m.text}
              </div>
            )}
            {"isCard" in m && m.isCard ? (
              <div className="chat-bubble-ai px-3.5 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-[12px] font-semibold text-white">Booking confirmed!</span>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 space-y-1.5">
                  {[["📅 Date","Saturday, Jan 13"],["🕐 Time","7:30 PM"],["👥 Guests","4 guests"],["🎟️ Code","CONF-2R7X"]].map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <span className="text-[11px] text-white/35">{k}</span>
                      <span className={`text-[11px] ${k === "🎟️ Code" ? "font-mono text-indigo-300" : "text-white/70"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : m.role === "ai" && !("isCard" in m) && (
              <div className="chat-bubble-ai text-white/70 text-[12px] px-3.5 py-2.5 rounded-2xl rounded-bl-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: m.text }} />
            )}
          </div>
        </motion.div>
      ))}
      <motion.div className="flex items-start gap-2.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3 h-3 text-white" />
        </div>
        <div className="chat-bubble-ai px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
          <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" style={{animationDelay:`${i*0.15}s`}}/>)}</div>
        </div>
      </motion.div>
    </div>
  );
}

function ReservationPreview() {
  const bookings = [
    { name: "Sarah K.", guests: 2, time: "7:00 PM", status: "confirmed" },
    { name: "Marco R.", guests: 4, time: "7:30 PM", status: "confirmed" },
    { name: "James T.", guests: 6, time: "8:00 PM", status: "pending" },
    { name: "Aisha L.", guests: 2, time: "8:30 PM", status: "confirmed" },
  ];
  return (
    <div className="p-5 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-white/40">Tonight · 4 bookings</span>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">All via AI</span>
      </div>
      {bookings.map((b, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.09, ease }}
          className="flex items-center gap-3 p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {b.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/80">{b.name}</p>
            <p className="text-[10px] text-white/30">{b.guests} guests · {b.time}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${
            b.status === "confirmed" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
          }`}>{b.status === "confirmed" ? "✓ Confirmed" : "Pending"}</span>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsPreview() {
  const pts = [30, 52, 38, 70, 45, 82, 58, 75, 50, 88, 63, 90];
  const max = Math.max(...pts);
  const w = 280, h = 64;
  const step = w / (pts.length - 1);
  const coords = pts.map((p, i) => `${i * step},${h - (p / max) * h}`).join(" ");
  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[["Conversations","247","+12%"],["Leads captured","38","+8%"],["Reservations","84","+24%"]].map(([label, value, change]) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease }}
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-2.5"
          >
            <div className="text-lg font-black text-white">{value}</div>
            <div className="text-[9px] text-white/30 mt-0.5 leading-snug">{label}</div>
            <div className="text-[9px] text-emerald-400 font-bold mt-0.5">{change}</div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
        <svg viewBox={`0 0 ${w} ${h + 8}`} className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${coords} ${w},${h}`} fill="url(#ag)" />
          <polyline points={coords} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-[9px] text-white/20 mt-2 text-center">Conversations · last 30 days</div>
      </motion.div>
    </div>
  );
}

function KnowledgePreview() {
  const docs = [
    { name: "spring_menu_2025.pdf", type: "PDF", chunks: 47, status: "indexed" },
    { name: "wine_list.docx", type: "DOC", chunks: 23, status: "indexed" },
    { name: "faq_and_policies.txt", type: "TXT", chunks: 31, status: "indexed" },
    { name: "allergy_guide.pdf", type: "PDF", chunks: 18, status: "syncing" },
  ];
  return (
    <div className="p-5 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-white/40">Indexed Documents</span>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">RAG Active</span>
      </div>
      {docs.map((doc, i) => (
        <motion.div key={doc.name}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.09, ease }}
          className="flex items-center gap-3 p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] font-bold text-white/35">{doc.type}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-white/65 font-mono truncate">{doc.name}</p>
            <p className="text-[10px] text-white/25">{doc.chunks} chunks indexed</p>
          </div>
          <span className={`text-[10px] font-semibold flex-shrink-0 ${doc.status === "indexed" ? "text-emerald-400" : "text-amber-400"}`}>
            {doc.status === "indexed" ? "✓" : "⟳"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Product Window ─────────────────────────────── */

function ProductWindow() {
  const chatMsgs = [
    { user: true, text: "I'd like to book a table for 4 this Friday at 7pm 🍽️", delay: 0.5 },
    { user: false, html: "I'd love to help! I have availability for <strong>Friday at 7:00 PM</strong> for a party of 4. Could I get your name?", delay: 1.0 },
    { user: true, text: "Marco Rossi", delay: 1.5 },
    { user: false, isCard: true, delay: 2.0 },
    { user: false, isTyping: true, delay: 2.8 },
  ] as const;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#05050F] shadow-2xl shadow-black/60">
      <div className="border-beam-animated absolute inset-0 rounded-2xl pointer-events-none" />

      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06] bg-black/50">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-white/[0.12]" />
          <div className="w-3 h-3 rounded-full bg-white/[0.12]" />
          <div className="w-3 h-3 rounded-full bg-white/[0.12]" />
        </div>
        <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 mx-4">
          <p className="text-[10px] text-white/20 text-center">your-restaurant.com · AI Chat</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 380 }}>
        {/* Sidebar */}
        <div className="w-[156px] border-r border-white/[0.05] p-3 hidden sm:flex flex-col flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] font-bold text-white/55">RestaurantAI</span>
          </div>
          <p className="text-[9px] text-white/15 uppercase tracking-widest px-2 mb-2">Recent</p>
          {["Book for Friday","Menu inquiry","Wine question"].map((t, i) => (
            <div key={t} className={`px-2.5 py-2 rounded-lg text-[10px] mb-0.5 cursor-default ${
              i === 0 ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "text-white/20"
            }`}>{t}</div>
          ))}
          <div className="mt-auto border-t border-white/[0.05] pt-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[9px] text-white/20">AI Online</span>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#05050F] to-transparent z-10 pointer-events-none" />
            <div className="p-4 pt-6 space-y-3.5">
              {chatMsgs.map((msg, i) => (
                <motion.div key={i}
                  className={`flex items-end gap-2 ${msg.user ? "justify-end" : ""}`}
                  initial={{ opacity: 0, x: msg.user ? 8 : -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: msg.delay, ease }}
                  viewport={{ once: true }}
                >
                  {!msg.user && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {"isTyping" in msg && msg.isTyping ? (
                    <div className="chat-bubble-ai px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                      <div className="flex gap-1">{[0,1,2].map(j=><div key={j} className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot" style={{animationDelay:`${j*0.15}s`}}/>)}</div>
                    </div>
                  ) : "isCard" in msg && msg.isCard ? (
                    <div className="chat-bubble-ai text-[11px] px-3.5 py-3 rounded-2xl rounded-bl-sm max-w-[230px]">
                      <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold text-white text-[12px]">Confirmed, Marco!</span>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2.5 space-y-1.5">
                        {[["📅","Friday, Jan 10"],["🕐","7:00 PM"],["👥","Party of 4"],["🎟️","CONF-A4X2"]].map(([icon,val],j)=>(
                          <div key={j} className="flex items-center justify-between gap-3">
                            <span className="text-white/35 text-[10px]">{icon}</span>
                            <span className={`text-[10px] ${j===3?"font-mono text-indigo-300":"text-white/65"}`}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : "html" in msg ? (
                    <div className="chat-bubble-ai text-white/70 text-[12px] px-3.5 py-2.5 rounded-2xl rounded-bl-sm max-w-[230px] leading-snug"
                      dangerouslySetInnerHTML={{ __html: msg.html }} />
                  ) : "text" in msg ? (
                    <div className="chat-bubble-user text-white text-[12px] px-3.5 py-2.5 rounded-2xl rounded-br-sm max-w-[230px] leading-snug">
                      {msg.text}
                    </div>
                  ) : null}
                </motion.div>
              ))}
            </div>
          </div>
          {/* Input bar */}
          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5">
              <input readOnly placeholder="Ask anything about the restaurant…"
                className="flex-1 bg-transparent text-[11px] text-white/20 placeholder:text-white/15 outline-none" />
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Navbar ──────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const links = [["Features","#features"],["How It Works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]] as const;
  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#02020A]/92 backdrop-blur-2xl border-b border-white/[0.05]" : ""
        }`}
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 h-[60px]">
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#02020A]" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white/90">RestaurantAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {links.map(([label, href]) => (
              <a key={label} href={href}
                className="text-[13px] text-white/38 hover:text-white/80 transition-colors duration-150 font-medium">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden md:block text-[13px] text-white/38 hover:text-white/75 transition-colors font-medium px-3 py-2">
              Log in
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 bg-white text-black text-[13px] font-bold px-4 py-2 rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all shadow-md shadow-black/20">
              Start free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => setOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] rounded-xl transition-all">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-lg md:hidden">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 38 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[#080810] border-l border-white/[0.07] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-[60px] border-b border-white/[0.06]">
                <span className="font-bold text-white/80">RestaurantAI</span>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {links.map(([label, href]) => (
                  <a key={label} href={href} onClick={() => setOpen(false)}
                    className="flex items-center px-3.5 py-3 rounded-xl text-[14px] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all font-medium">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="p-4 border-t border-white/[0.05] space-y-2.5">
                <Link href="/login" onClick={() => setOpen(false)}
                  className="block text-center text-[14px] text-white/40 hover:text-white/70 py-2.5 transition-colors font-medium">
                  Log in
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}
                  className="block text-center bg-white text-black font-bold text-[14px] py-3 rounded-xl hover:bg-white/90 transition-all">
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

/* ─── FAQ Item ────────────────────────────────────────── */

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.045, duration: 0.5, ease }}
      className="border-b border-white/[0.06]"
    >
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-6 group">
        <span className="text-[15px] font-semibold text-white/65 group-hover:text-white/90 transition-colors leading-snug">{q}</span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-5 h-5 rounded-full border border-white/[0.14] flex items-center justify-center flex-shrink-0 group-hover:border-white/25 transition-colors"
        >
          <span className="text-white/35 text-sm leading-none group-hover:text-white/60 transition-colors select-none">+</span>
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden"
          >
            <p className="text-[14px] text-white/38 leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Marquee ─────────────────────────────────────────── */

function MarqueeBar() {
  const items = [...RESTAURANTS, ...RESTAURANTS];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.05] py-5">
      <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-[#02020A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-[#02020A] to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((name, i) => (
          <div key={i} className="flex items-center gap-5 mx-7 flex-shrink-0">
            <span className="w-1 h-1 rounded-full bg-indigo-500/30 flex-shrink-0" />
            <span className="text-[13px] text-white/18 font-medium tracking-tight">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const [annual, setAnnual] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const price = annual ? 39 : 49;

  const featurePreviews: Record<string, JSX.Element> = {
    chat: <ChatPreview />,
    reservations: <ReservationPreview />,
    analytics: <AnalyticsPreview />,
    knowledge: <KnowledgePreview />,
  };

  return (
    <div className="min-h-screen bg-[#02020A] text-white overflow-x-hidden">
      {/* Page background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        <div className="absolute -top-80 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(79,70,229,0.09) 0%, rgba(79,70,229,0.03) 45%, transparent 70%)" }} />
      </div>

      <Navbar />

      {/* ═══ HERO ════════════════════════════════════════ */}
      <motion.section ref={heroRef} style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 pt-[148px] pb-24 px-6 max-w-[1100px] mx-auto text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] rounded-full px-4 py-2 mb-10 cursor-default"
        >
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          <span className="text-[12px] text-white/38 font-medium">GPT-4o · RAG-powered · Streaming</span>
        </motion.div>

        {/* Headline */}
        <div className="mb-7">
          <motion.div
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55, ease }}
            className="text-[58px] sm:text-[80px] lg:text-[96px] font-black tracking-[-0.04em] leading-[0.9] text-white/22 mb-1"
          >
            Every guest question.
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17, duration: 0.55, ease }}
            className="text-[58px] sm:text-[80px] lg:text-[96px] font-black tracking-[-0.04em] leading-[0.9] text-white"
          >
            Answered instantly.
          </motion.div>
        </div>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease }}
          className="text-[16px] sm:text-[18px] text-white/33 max-w-[460px] mx-auto mb-10 leading-relaxed tracking-[-0.01em]"
        >
          RestaurantAI books tables, answers menus, captures leads, and delights every guest — automatically, around the clock.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
        >
          <Link href="/register"
            className="group flex items-center gap-2 bg-white text-black font-bold text-[14px] px-7 py-3.5 rounded-2xl hover:bg-white/90 active:scale-[0.97] transition-all shadow-xl shadow-black/25">
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/chat"
            className="flex items-center gap-2 glass border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.14] text-white/55 hover:text-white/90 font-medium text-[14px] px-6 py-3.5 rounded-2xl transition-all duration-200">
            <Play className="w-3.5 h-3.5 fill-current" />
            Try live demo
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55, ease }}
          className="inline-flex border border-white/[0.07] rounded-2xl overflow-hidden bg-white/[0.02] divide-x divide-white/[0.07] max-w-lg w-full"
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex-1 px-5 py-4 text-center">
              <div className="text-xl sm:text-2xl font-black text-white/90 tracking-tight tabular-nums">{s.value}</div>
              <div className="text-[10px] text-white/22 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ═══ MARQUEE ═════════════════════════════════════ */}
      <MarqueeBar />

      {/* ═══ PRODUCT WINDOW ══════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease }}
        className="relative z-10 px-6 py-24 max-w-[1100px] mx-auto"
      >
        <div className="text-center mb-12">
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ ease }}
            className="text-[11px] font-semibold text-indigo-400/60 uppercase tracking-[0.18em] mb-3"
          >See it in action</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.05, ease }}
            className="text-4xl sm:text-5xl font-black tracking-[-0.03em] leading-tight"
          >
            Conversational AI that<br />actually books tables.
          </motion.h2>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-3/4 h-24 rounded-full bg-indigo-500/8 blur-3xl pointer-events-none" />
          <ProductWindow />
        </div>
      </motion.section>

      {/* ═══ FEATURES ════════════════════════════════════ */}
      <section id="features" className="relative z-10 px-6 py-24 max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
            className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-4"
          >One platform. Everything you need.</motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.07, ease }}
            className="text-[16px] text-white/30 max-w-sm mx-auto tracking-tight"
          >No tool stack. No integrations. One AI that runs your entire front-of-house.</motion.p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-4 items-start">
          {/* Tab list */}
          <div className="space-y-1.5">
            {FEATURES.map((f, i) => {
              const active = activeTab === f.id;
              return (
                <motion.button key={f.id}
                  initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06, ease }}
                  onClick={() => setActiveTab(f.id)}
                  className={`feature-tab w-full text-left p-4 rounded-2xl border ${
                    active ? "feature-tab-active" : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      active ? "bg-indigo-500/18 border border-indigo-500/28" : "bg-white/[0.04] border border-white/[0.07]"
                    }`}>
                      <f.icon className={`w-4 h-4 transition-colors ${active ? "text-indigo-400" : "text-white/28"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[14px] font-semibold transition-colors ${active ? "text-white" : "text-white/45"}`}>{f.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border transition-all ${
                          active ? f.badgeColor : "text-white/18 bg-white/[0.04] border-white/[0.07]"
                        }`}>{f.badge}</span>
                      </div>
                      <p className={`text-[13px] leading-relaxed transition-colors ${active ? "text-white/45" : "text-white/22"}`}>{f.title}</p>
                      <AnimatePresence>
                        {active && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease }}
                            className="text-[13px] text-white/32 leading-relaxed mt-2.5"
                          >{f.desc}</motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Preview panel */}
          <div className="sticky top-24">
            <div className="relative overflow-hidden rounded-2xl bg-[#05050F] border border-white/[0.08] shadow-2xl shadow-black/50" style={{ minHeight: 320 }}>
              <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
                <div className="scan-line absolute inset-x-0 h-32" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-black/30">
                <div className="flex gap-1.5">
                  {[0,1,2].map(i=><div key={i} className="w-2.5 h-2.5 rounded-full bg-white/[0.11]"/>)}
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-white/15">
                    {FEATURES.find(f => f.id === activeTab)?.label}
                  </span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease }}
                >
                  {featurePreviews[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 px-6 py-24 max-w-[1100px] mx-auto">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
            className="text-4xl sm:text-5xl font-black tracking-[-0.03em]"
          >Live in 5 minutes.</motion.h2>
        </div>
        <div className="relative grid md:grid-cols-3 gap-10 md:gap-8">
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.28), transparent)" }} />
          {STEPS.map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55, ease }}
              className="text-center"
            >
              <div className="w-[104px] h-[104px] rounded-3xl bg-white/[0.025] border border-white/[0.07] flex items-center justify-center mx-auto mb-6">
                <span className="text-[42px] font-black text-white/[0.07] tracking-tighter select-none">{step.n}</span>
              </div>
              <h3 className="font-bold text-white/85 text-[16px] mb-2.5 tracking-tight">{step.title}</h3>
              <p className="text-[14px] text-white/33 leading-relaxed max-w-[200px] mx-auto">{step.body}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.35, ease }} className="text-center mt-12">
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/22 hover:bg-indigo-500/15 hover:border-indigo-500/38 text-indigo-400/80 hover:text-indigo-400 font-semibold text-[14px] px-6 py-3 rounded-xl transition-all">
            <Sparkles className="w-4 h-4" />
            Start your setup now
          </Link>
        </motion.div>
      </section>

      {/* ═══ TESTIMONIALS ════════════════════════════════ */}
      <section className="relative z-10 px-6 py-24 max-w-[1100px] mx-auto">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-0.5 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
          <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
            className="text-4xl sm:text-5xl font-black tracking-[-0.03em]"
          >Loved by restaurant owners.</motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.author}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.6, ease }}
              className="premium-card p-7 flex flex-col relative"
            >
              <div className="absolute top-6 right-6 text-right select-none">
                <div className="text-2xl font-black text-white/[0.07]">{t.metric}</div>
                <div className="text-[9px] text-white/15 font-medium uppercase tracking-wider">{t.mLabel}</div>
              </div>
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-[14px] text-white/50 leading-relaxed mb-7 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-5 border-t border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white/75">{t.author}</p>
                  <p className="text-[11px] text-white/28">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═════════════════════════════════════ */}
      <section id="pricing" className="relative z-10 px-6 py-24 max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.55, ease }}
            className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-8"
          >Simple, honest pricing.</motion.h2>
          <div className="inline-flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
            {(["Monthly","Annual"] as const).map((period) => (
              <button key={period} onClick={() => setAnnual(period === "Annual")}
                className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                  (period === "Annual") === annual ? "bg-white text-black shadow-md" : "text-white/38 hover:text-white/65"
                }`}
              >
                {period}
                {period === "Annual" && <span className="ml-2 text-[10px] text-emerald-400 font-bold">−20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            className="premium-card p-8"
          >
            <h3 className="font-black text-white/85 text-xl mb-1 tracking-tight">Starter</h3>
            <p className="text-[13px] text-white/28 mb-6">For testing and small restaurants</p>
            <div className="flex items-end gap-2 mb-7">
              <span className="text-5xl font-black text-white tracking-tight">$0</span>
              <span className="text-white/28 text-[13px] mb-2">/ month</span>
            </div>
            <Link href="/register"
              className="block text-center text-[14px] font-semibold bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] hover:border-white/[0.16] text-white/65 hover:text-white px-5 py-3 rounded-xl mb-7 transition-all">
              Get started free
            </Link>
            <ul className="space-y-3">
              {STARTER.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[13px] text-white/40">
                  <Check className="w-4 h-4 text-white/18 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            className="relative pricing-popular rounded-2xl p-8 overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/55 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-indigo-500/6 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white text-xl tracking-tight">Pro</h3>
                <span className="text-[10px] font-black text-white bg-gradient-to-r from-indigo-500 to-violet-600 px-2.5 py-1 rounded-full shadow-lg shadow-indigo-500/25">Most Popular</span>
              </div>
              <p className="text-[13px] text-white/28 mb-6">For serious restaurant owners</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="text-5xl font-black text-white tracking-tight">${price}</span>
                <div className="mb-2">
                  <div className="text-white/28 text-[13px]">/ month</div>
                  {annual && <div className="text-[10px] text-emerald-400 font-semibold">billed annually</div>}
                </div>
              </div>
              <Link href="/register"
                className="block text-center text-[14px] font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-3.5 rounded-xl mb-7 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25">
                Start 14-day free trial
              </Link>
              <ul className="space-y-3">
                {PRO.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[13px] text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ ═════════════════════════════════════════ */}
      <section id="faq" className="relative z-10 px-6 py-24 max-w-2xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.55, ease }}
          className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-12 text-center"
        >Common questions.</motion.h2>
        <div>{FAQS.map((faq, i) => <FAQItem key={faq.q} {...faq} i={i} />)}</div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════ */}
      <section className="relative z-10 px-6 py-24 max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.65, ease }}
          className="relative p-14 sm:p-20 rounded-3xl overflow-hidden text-center"
          style={{
            background: "linear-gradient(145deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 50%, rgba(236,72,153,0.03) 100%)",
            border: "1px solid rgba(99,102,241,0.16)",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-indigo-500/45 to-transparent" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-indigo-500/6 blur-[80px] pointer-events-none" />
          <div className="relative">
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-7 shadow-2xl shadow-indigo-500/28"
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] mb-4">Start in 5 minutes.</h2>
            <p className="text-white/32 text-[16px] mb-9 max-w-sm mx-auto leading-relaxed">
              Connect your Drive, set your hours, and your AI is live before your next service.
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2.5 bg-white text-black font-bold text-[15px] px-9 py-4 rounded-2xl hover:bg-white/90 active:scale-[0.97] transition-all shadow-2xl shadow-black/20">
              <Sparkles className="w-4 h-4" />
              Get started for free
            </Link>
            <p className="text-white/18 text-[11px] mt-4 tracking-tight">No credit card · 14-day trial · Cancel anytime</p>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-12">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[14px] text-white/42">RestaurantAI</span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-6">
            {[["Features","#features"],["How It Works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"],["Dashboard","/dashboard"],["Chat","/chat"]].map(([label, href]) => (
              <a key={label} href={href} className="text-[12px] text-white/22 hover:text-white/50 transition-colors">{label}</a>
            ))}
          </div>
          <p className="text-[11px] text-white/15">© {new Date().getFullYear()} RestaurantAI</p>
        </div>
      </footer>
    </div>
  );
}
