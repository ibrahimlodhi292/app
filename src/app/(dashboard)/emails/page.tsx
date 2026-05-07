"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Mail, XCircle } from "lucide-react";
import { format } from "date-fns";
import { type EmailLog } from "@/types";

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; badge: string; label: string }> = {
  SENT:    { icon: <CheckCircle2 className="w-3.5 h-3.5" />, badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Sent" },
  FAILED:  { icon: <XCircle className="w-3.5 h-3.5" />,     badge: "text-red-400 bg-red-500/10 border-red-500/20",           label: "Failed" },
  PENDING: { icon: <Clock className="w-3.5 h-3.5" />,       badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",     label: "Pending" },
  BOUNCED: { icon: <XCircle className="w-3.5 h-3.5" />,     badge: "text-orange-400 bg-orange-500/10 border-orange-500/20",  label: "Bounced" },
};

export default function EmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/emails?pageSize=50");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data || []);
          setTotal(data.total || 0);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const sentCount = logs.filter((l) => l.status === "SENT").length;
  const failedCount = logs.filter((l) => l.status === "FAILED").length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Email Logs</h1>
          <p className="text-white/35 mt-1 text-sm">{total} emails sent total</p>
        </div>
        {!isLoading && total > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">{sentCount} sent</span>
            </div>
            {failedCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">{failedCount} failed</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div>
            <div className="grid grid-cols-6 px-5 py-3.5 border-b border-white/[0.05] gap-4">
              {["To", "Subject", "Template", "Status", "Attempts", "Sent At"].map((h) => (
                <div key={h} className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-5 px-5 py-4 border-b border-white/[0.04] animate-pulse">
                <div className="flex-1 h-3 bg-white/[0.06] rounded" />
                <div className="flex-[2] h-3 bg-white/[0.05] rounded" />
                <div className="w-20 h-5 bg-white/[0.04] rounded-full" />
                <div className="w-16 h-5 bg-white/[0.04] rounded-full" />
                <div className="w-6 h-3 bg-white/[0.04] rounded" />
                <div className="w-24 h-3 bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/30">No emails sent yet</p>
            <p className="text-xs text-white/15 mt-1">Reservation confirmations and lead notifications appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["To", "Subject", "Template", "Status", "Attempts", "Sent At"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {logs.map((log, i) => {
                    const config = STATUS_CONFIG[log.status];
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-white/60 font-medium">{log.to}</td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-white max-w-[200px] truncate">{log.subject}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] text-white/35 bg-white/[0.05] border border-white/[0.07] rounded-full px-2.5 py-1 font-medium">
                            {log.template}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {config && (
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.badge}`}>
                              {config.icon}
                              {config.label}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-white/35">{log.attempts}</td>
                        <td className="px-5 py-4 text-[11px] text-white/25">
                          {log.sentAt ? format(new Date(log.sentAt), "MMM d, h:mm a") : "—"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
