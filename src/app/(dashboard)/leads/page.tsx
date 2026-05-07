"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Search, TrendingUp, User, Users } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { type Lead } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
  CONTACTED: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  QUALIFIED: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  CONVERTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  LOST: "bg-red-500/15 text-red-400 border-red-500/25",
};

const STATUS_OPTIONS = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 40 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${color}`}>
      <TrendingUp className="w-3 h-3" />
      {score}
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchLeads() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (status !== "ALL") params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchLeads(); }, [page, status, search]);

  async function updateStatus(id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/leads?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus as Lead["status"] } : l)));
        toast.success("Status updated");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Leads</h1>
        <p className="text-white/35 mt-1 text-sm">{total} total leads captured by AI</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                status === s
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div className="divide-y divide-white/[0.04]">
            <div className="grid grid-cols-6 px-5 py-3 border-b border-white/[0.05]">
              {["Contact", "Inquiry", "Score", "Status", "Date", "Actions"].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-5 px-5 py-4 animate-pulse">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                  <div>
                    <div className="w-24 h-3 bg-white/[0.06] rounded mb-1.5" />
                    <div className="w-32 h-2.5 bg-white/[0.04] rounded" />
                  </div>
                </div>
                <div className="w-28 h-3 bg-white/[0.04] rounded flex-1" />
                <div className="w-12 h-6 bg-white/[0.04] rounded-lg" />
                <div className="w-20 h-6 bg-white/[0.04] rounded-lg" />
                <div className="w-16 h-3 bg-white/[0.04] rounded" />
                <div className="w-12 h-3 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/30">No leads found</p>
            <p className="text-xs text-white/15 mt-1">
              {search || status !== "ALL" ? "Try adjusting your filters" : "AI will capture leads from conversations"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Contact", "Inquiry", "Score", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {leads.map((lead, i) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {lead.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{lead.name || "Anonymous"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {lead.email && (
                                <span className="flex items-center gap-1 text-[10px] text-white/25">
                                  <Mail className="w-2.5 h-2.5" /> {lead.email}
                                </span>
                              )}
                              {lead.phone && !lead.email && (
                                <span className="flex items-center gap-1 text-[10px] text-white/25">
                                  <Phone className="w-2.5 h-2.5" /> {lead.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-white/50 max-w-[180px] truncate">{lead.inquiry || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <ScoreBadge score={lead.score} />
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          disabled={updatingId === lead.id}
                          className={`text-[11px] font-semibold px-2 py-1.5 rounded-lg border cursor-pointer bg-transparent focus:outline-none transition-all ${STATUS_STYLES[lead.status]}`}
                        >
                          {["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((s) => (
                            <option key={s} value={s} className="bg-[#0f0f1a] text-white">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] text-white/25">{format(new Date(lead.createdAt), "MMM d, yyyy")}</span>
                      </td>
                      <td className="px-5 py-4">
                        {lead.email && (
                          <a href={`mailto:${lead.email}`}
                            className="text-[11px] text-indigo-400/70 hover:text-indigo-400 transition-colors font-medium">
                            Email →
                          </a>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs text-white/50 bg-white/[0.04] border border-white/[0.07] rounded-xl disabled:opacity-30 hover:bg-white/[0.07] transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-white/30">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs text-white/50 bg-white/[0.04] border border-white/[0.07] rounded-xl disabled:opacity-30 hover:bg-white/[0.07] transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
