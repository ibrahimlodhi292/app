"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Check, Clock, Users, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { type Reservation } from "@/types";

const STATUS_CONFIG: Record<string, { badge: string; dot: string; label: string }> = {
  PENDING:   { badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",   dot: "bg-amber-400",   label: "Pending" },
  CONFIRMED: { badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25", dot: "bg-indigo-400",  label: "Confirmed" },
  CANCELLED: { badge: "bg-red-500/15 text-red-400 border-red-500/25",         dot: "bg-red-400",     label: "Cancelled" },
  COMPLETED: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400", label: "Completed" },
  NO_SHOW:   { badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",       dot: "bg-zinc-400",    label: "No Show" },
};

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchReservations() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (dateFilter) params.set("date", dateFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/reservations?${params}`);
      const data = await res.json();
      if (data.success) {
        setReservations(data.data);
        setTotal(data.total);
      }
    } catch {
      toast.error("Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchReservations(); }, [dateFilter, statusFilter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/reservations?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: status as Reservation["status"] } : r)));
        toast.success("Reservation updated");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = reservations.filter((r) => r.status === "PENDING").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Reservations</h1>
          <p className="text-white/35 mt-1 text-sm">{total} total reservations</p>
        </div>
        {pendingCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2"
          >
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs text-amber-400 font-semibold">{pendingCount} pending</span>
          </motion.div>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-3 items-center"
      >
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/40 transition-all [color-scheme:dark]"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Clear date
          </button>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                statusFilter === s
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              {s.replace("_", " ")}
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
          <div>
            <div className="border-b border-white/[0.05] px-5 py-3.5 grid grid-cols-6 gap-4">
              {["Guest", "Party", "Date & Time", "Status", "Code", "Actions"].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-white/[0.04] animate-pulse flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-28 h-3 bg-white/[0.06] rounded mb-1.5" />
                  <div className="w-20 h-2.5 bg-white/[0.04] rounded" />
                </div>
                <div className="w-8 h-3 bg-white/[0.04] rounded" />
                <div className="flex-1">
                  <div className="w-24 h-3 bg-white/[0.06] rounded mb-1.5" />
                  <div className="w-16 h-2.5 bg-white/[0.04] rounded" />
                </div>
                <div className="w-20 h-6 bg-white/[0.04] rounded-full" />
                <div className="w-20 h-6 bg-white/[0.04] rounded-lg" />
                <div className="w-24 h-6 bg-white/[0.04] rounded-lg" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/30">No reservations found</p>
            <p className="text-xs text-white/15 mt-1">
              {dateFilter || statusFilter !== "ALL" ? "Try different filters" : "Bookings made through AI appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Guest", "Party", "Date & Time", "Status", "Code", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {reservations.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-white">{r.guestName}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{r.guestEmail || r.guestPhone || "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                          <Users className="w-3.5 h-3.5 text-white/30" />
                          <span className="font-medium">{r.partySize}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-white font-medium">{format(new Date(r.date), "MMM d, yyyy")}</p>
                        <p className="text-[11px] text-white/35 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" /> {r.timeSlot}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[r.status]?.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[r.status]?.dot}`} />
                          {STATUS_CONFIG[r.status]?.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <code className="font-mono text-[11px] text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-lg">
                          {r.confirmationCode.slice(0, 8).toUpperCase()}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        {r.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateStatus(r.id, "CONFIRMED")}
                              disabled={updating === r.id}
                              className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all font-medium disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(r.id, "CANCELLED")}
                              disabled={updating === r.id}
                              className="flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-all font-medium disabled:opacity-50"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-white/20">—</span>
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
    </div>
  );
}
