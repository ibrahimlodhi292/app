"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Bot, Calendar, Database,
  LayoutDashboard, LogOut, Mail,
  MessageSquare, Settings, Users, Sparkles, ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/conversations", icon: MessageSquare, label: "Conversations" },
  { href: "/dashboard/leads", icon: Users, label: "Leads" },
  { href: "/dashboard/reservations", icon: Calendar, label: "Reservations" },
  { href: "/dashboard/knowledge-base", icon: Database, label: "Knowledge Base" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/emails", icon: Mail, label: "Email Logs" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/login");
  }

  function isActive(item: typeof navItems[0]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <aside className="w-56 xl:w-60 bg-[#060608] border-r border-white/[0.05] flex flex-col h-full flex-shrink-0 relative">
      {/* Subtle gradient top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative p-5 border-b border-white/[0.05]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-sm group-hover:scale-105 transition-transform">
            <Bot className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">RestaurantAI</p>
            <p className="text-white/25 text-[10px] truncate max-w-[110px]">
              {user?.restaurant?.name || "Dashboard"}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-hidden">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer ${
                  active
                    ? "nav-active text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {active && (
                  <motion.div layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-xl nav-active"
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  />
                )}
                <item.icon className={`w-4 h-4 relative z-10 flex-shrink-0 transition-colors ${
                  active ? "text-indigo-400" : "text-white/30 group-hover:text-white/50"
                }`} />
                <span className="relative z-10 flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 relative z-10 text-indigo-400/50" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 space-y-1 border-t border-white/[0.05]">
        {/* AI status */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40" />
          </div>
          <span className="text-[10px] text-white/25 font-medium">AI Assistant Online</span>
        </div>

        <Link href="/chat">
          <motion.div whileHover={{ x: 2 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer">
            <Sparkles className="w-4 h-4 text-indigo-400/50" />
            Open Chat
          </motion.div>
        </Link>

        <motion.button whileHover={{ x: 2 }} onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/[0.05] transition-all">
          <LogOut className="w-4 h-4" />
          Sign out
        </motion.button>
      </div>
    </aside>
  );
}
