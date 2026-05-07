"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight, Bot, Calendar, MessageSquare,
  TrendingUp, Users, Sparkles, Zap, Activity,
  ArrowRight, Circle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface AnalyticsData {
  chartData: { date: string; chats: number; messages: number; leads: number; reservations: number }[];
  totals: { chats: number; messages: number; leads: number; reservations: number };
  totalLeads: number;
  totalReservations: number;
  recentConversations: number;
  topLeads: { id: string; name: string | null; email: string | null; score: number; inquiry: string | null }[];
}

/* Animated count-up hook */
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const raf = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* Mini sparkline using SVG */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data) || 1;
  const w = 80, h = 28;
  const step = w / (data.length - 1);
  const coords = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-16 h-7 opacity-70" preserveAspectRatio="none">
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, change, gradient, sparkColor, sparkData, delay }: {
  icon: React.ElementType;
  label: string;
  value: number;
  change?: string;
  gradient: string;
  sparkColor: string;
  sparkData?: number[];
  delay: number;
}) {
  const count = useCountUp(value, 900 + delay * 300);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 280, damping: 28 }}
      className="relative group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.11] transition-all duration-300 overflow-hidden cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
          {change && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 rounded-full px-1.5 py-0.5 font-bold">
              <ArrowUpRight className="w-2.5 h-2.5" />
              {change}
            </span>
          )}
        </div>
      </div>
      <div className="text-3xl font-black text-white tabular-nums">{count.toLocaleString()}</div>
      <div className="text-[11px] text-white/35 mt-1 font-medium">{label}</div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.06]" />
        <div className="w-16 h-7 rounded bg-white/[0.04]" />
      </div>
      <div className="w-16 h-8 rounded-lg bg-white/[0.06] mb-2" />
      <div className="w-28 h-3 rounded bg-white/[0.04]" />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0c14] border border-white/[0.1] rounded-xl px-4 py-3 shadow-2xl shadow-black/50">
      <p className="text-[10px] text-white/35 mb-2 font-semibold uppercase tracking-wide">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mb-1 last:mb-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="text-white font-bold ml-auto pl-3">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* Fake activity feed items */
function generateActivity(data: AnalyticsData | null) {
  if (!data) return [];
  const events = [];
  if (data.topLeads?.length) {
    events.push({ type: "lead", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10", label: `New lead captured`, sub: data.topLeads[0]?.name || "Anonymous", time: "2m ago" });
  }
  if (data.totals?.chats) {
    events.push({ type: "chat", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "New conversation started", sub: "Guest asked about the menu", time: "8m ago" });
  }
  if (data.totalReservations) {
    events.push({ type: "reservation", icon: Calendar, color: "text-violet-400", bg: "bg-violet-500/10", label: "Reservation confirmed", sub: "Party of 4 · Friday 7PM", time: "14m ago" });
  }
  events.push({ type: "ai", icon: Bot, color: "text-amber-400", bg: "bg-amber-500/10", label: "Knowledge base synced", sub: "3 documents re-indexed", time: "1h ago" });
  events.push({ type: "chat", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10", label: "Conversation escalated", sub: "Guest had a special request", time: "2h ago" });
  return events;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics?days=30")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const activity = generateActivity(data);

  const sparkData = data?.chartData?.slice(-7).map((d) => d.chats) ?? [];
  const leadSparkData = data?.chartData?.slice(-7).map((d) => d.leads) ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-black text-white">
            {greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-white/30 mt-1 text-sm">
            {format(new Date(), "EEEE, MMMM d")}
            {user?.restaurant?.name && (
              <> · <span className="text-white/45">{user.restaurant.name}</span></>
            )}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="hidden sm:flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-xl px-3 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-emerald-400 font-semibold">AI Active</span>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={MessageSquare} label="Conversations (30d)" value={data?.totals.chats ?? 0}
              gradient="from-indigo-500 to-violet-600" sparkColor="#818cf8"
              sparkData={sparkData} change="+12%" delay={0.05} />
            <StatCard icon={Users} label="Total Leads" value={data?.totalLeads ?? 0}
              gradient="from-emerald-500 to-teal-600" sparkColor="#34d399"
              sparkData={leadSparkData} change="+8%" delay={0.1} />
            <StatCard icon={Calendar} label="Reservations" value={data?.totalReservations ?? 0}
              gradient="from-violet-500 to-purple-600" sparkColor="#a78bfa" delay={0.15} />
            <StatCard icon={TrendingUp} label="Messages" value={data?.totals.messages ?? 0}
              gradient="from-amber-500 to-orange-600" sparkColor="#fbbf24" delay={0.2} />
          </>
        )}
      </div>

      {/* Main content: chart + activity */}
      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white">Activity Overview</h2>
              <p className="text-[11px] text-white/25 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ color: "#818cf8", label: "Chats" }, { color: "#34d399", label: "Leads" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[11px] text-white/30">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="h-52 bg-white/[0.03] rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={data?.chartData ?? []} margin={{ top: 5, right: 5, bottom: 0, left: -22 }}>
                <defs>
                  <linearGradient id="grad_chats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad_leads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.08)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="chats" name="Chats" stroke="#818cf8" strokeWidth={2} fill="url(#grad_chats)" dot={false} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#34d399" strokeWidth={2} fill="url(#grad_leads)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/30" />
              <h2 className="font-bold text-white text-sm">Recent Activity</h2>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 flex-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-7 h-7 rounded-xl bg-white/[0.06] flex-shrink-0" />
                  <div className="flex-1 pt-1">
                    <div className="w-36 h-3 bg-white/[0.06] rounded mb-1.5" />
                    <div className="w-24 h-2.5 bg-white/[0.04] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-white/15" />
              </div>
              <p className="text-sm text-white/25 font-medium">No activity yet</p>
              <p className="text-xs text-white/15 mt-1">Events appear as guests chat</p>
            </div>
          ) : (
            <div className="space-y-1 flex-1 overflow-y-auto scrollbar-hidden">
              {activity.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors group"
                >
                  <div className={`w-7 h-7 rounded-xl ${event.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <event.icon className={`w-3.5 h-3.5 ${event.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/75 leading-snug truncate">{event.label}</p>
                    <p className="text-[11px] text-white/30 truncate">{event.sub}</p>
                  </div>
                  <span className="text-[10px] text-white/20 flex-shrink-0 mt-0.5 tabular-nums">{event.time}</span>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/[0.05]">
            <Link href="/chat"
              className="w-full flex items-center justify-center gap-2 bg-indigo-500/[0.08] border border-indigo-500/15 hover:bg-indigo-500/12 hover:border-indigo-500/25 rounded-xl py-2.5 text-xs text-indigo-400 font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Open Chat Interface
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Hot Leads */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-white">Hot Leads</h2>
            <p className="text-[11px] text-white/25 mt-0.5">Highest intent, scored by AI</p>
          </div>
          <Link href="/dashboard/leads" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-semibold">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl animate-pulse">
                <div className="w-9 h-9 rounded-full bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1">
                  <div className="w-20 h-3 bg-white/[0.06] rounded mb-1.5" />
                  <div className="w-32 h-2.5 bg-white/[0.04] rounded" />
                </div>
                <div className="w-10 h-6 bg-white/[0.04] rounded-lg" />
              </div>
            ))}
          </div>
        ) : !data?.topLeads?.length ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-sm text-white/25 font-medium">No leads yet</p>
            <p className="text-xs text-white/15 mt-1">AI captures leads automatically from conversations</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.topLeads.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.09] transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{lead.name ?? "Anonymous"}</p>
                  <p className="text-[11px] text-white/30 truncate">{lead.inquiry ?? lead.email ?? "No inquiry"}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                  lead.score >= 70 ? "text-emerald-400 bg-emerald-500/10" :
                  lead.score >= 40 ? "text-amber-400 bg-amber-500/10" :
                  "text-red-400 bg-red-500/10"
                }`}>
                  {lead.score}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
