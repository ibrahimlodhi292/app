"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, Calendar, MessageSquare, TrendingUp, Users } from "lucide-react";

interface AnalyticsData {
  chartData: { date: string; chats: number; messages: number; leads: number; reservations: number }[];
  totals: { chats: number; messages: number; leads: number; reservations: number };
  totalLeads: number;
  totalReservations: number;
}

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c0c14] border border-white/[0.1] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] text-white/40 mb-2 font-medium uppercase tracking-wide">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/50">{p.name}:</span>
          <span className="text-white font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [days]);

  const stats = [
    { icon: MessageSquare, label: "Conversations", value: data?.totals.chats || 0, gradient: "from-indigo-500 to-violet-600", glow: "bg-indigo-500/5" },
    { icon: TrendingUp,    label: "Messages",       value: data?.totals.messages || 0, gradient: "from-violet-500 to-purple-600", glow: "bg-violet-500/5" },
    { icon: Users,         label: "New Leads",      value: data?.totals.leads || 0, gradient: "from-emerald-500 to-teal-600", glow: "bg-emerald-500/5" },
    { icon: Calendar,      label: "Reservations",   value: data?.totals.reservations || 0, gradient: "from-amber-500 to-orange-600", glow: "bg-amber-500/5" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-white/35 mt-1 text-sm">Performance insights for your AI assistant</p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                days === p.days
                  ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/30"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 30 }}
            className={`relative group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 overflow-hidden`}
          >
            <div className={`absolute inset-0 ${stat.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              {isLoading ? (
                <>
                  <div className="w-20 h-8 bg-white/[0.06] rounded-lg animate-pulse mb-2" />
                  <div className="w-28 h-3 bg-white/[0.04] rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-black text-white">{stat.value.toLocaleString()}</div>
                  <div className="text-xs text-white/35 mt-1 font-medium">{stat.label} ({days}d)</div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Chats & Messages</h2>
            <p className="text-xs text-white/30 mt-0.5">Conversation volume over time</p>
          </div>
          <div className="flex items-center gap-4">
            {[{ color: "#818cf8", label: "Chats" }, { color: "#c084fc", label: "Messages" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-xs text-white/35">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="h-64 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.chartData || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="g_chats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g_msgs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="chats" name="Chats" stroke="#818cf8" fill="url(#g_chats)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="messages" name="Messages" stroke="#c084fc" fill="url(#g_msgs)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white">Leads & Reservations</h2>
            <p className="text-xs text-white/30 mt-0.5">Business conversions captured by AI</p>
          </div>
          <div className="flex items-center gap-4">
            {[{ color: "#34d399", label: "Leads" }, { color: "#fbbf24", label: "Reservations" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs text-white/35">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="h-64 bg-white/[0.03] rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.chartData || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" name="Leads" fill="#34d399" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Bar dataKey="reservations" name="Reservations" fill="#fbbf24" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
