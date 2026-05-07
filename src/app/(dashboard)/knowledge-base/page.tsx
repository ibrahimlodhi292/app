"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, CheckCircle2, Database, ExternalLink,
  FileText, FolderOpen, Loader2, Plus, RefreshCw, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { type Document } from "@/types";

const SYNC_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  IDLE:    { color: "text-white/30", label: "Idle" },
  SYNCING: { color: "text-indigo-400", label: "Syncing..." },
  SUCCESS: { color: "text-emerald-400", label: "Synced" },
  FAILED:  { color: "text-red-400", label: "Failed" },
};

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [folderIds, setFolderIds] = useState<string[]>([""]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/google/drive?action=documents");
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.data || []);
          setIsConnected(true);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    checkConnection();
  }, []);

  async function handleConnect() {
    const res = await fetch("/api/google/drive?action=auth-url");
    const { url } = await res.json();
    window.open(url, "_blank");
  }

  async function handleSync() {
    const validIds = folderIds.filter((id) => id.trim());
    if (validIds.length === 0) {
      toast.error("Please enter at least one folder ID");
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch("/api/google/drive?action=sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderIds: validIds }),
      });
      const data = await res.json();
      if (data.success) {
        const { synced, failed, skipped } = data.data;
        toast.success(`Sync complete: ${synced} synced, ${skipped} skipped, ${failed} failed`);
        const docsRes = await fetch("/api/google/drive?action=documents");
        const docsData = await docsRes.json();
        setDocuments(docsData.data || []);
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Sync failed. Check your connection.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Knowledge Base</h1>
        <p className="text-white/35 mt-1 text-sm">Sync Google Drive documents to power your AI assistant</p>
      </motion.div>

      {/* Connection status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`relative overflow-hidden rounded-2xl border p-6 transition-colors ${
          isConnected
            ? "bg-emerald-500/[0.05] border-emerald-500/20"
            : "bg-white/[0.03] border-white/[0.07]"
        }`}
      >
        {isConnected && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        )}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isConnected ? "bg-emerald-500/15 border border-emerald-500/25" : "bg-white/[0.05] border border-white/[0.08]"
            }`}>
              <Database className={`w-6 h-6 ${isConnected ? "text-emerald-400" : "text-white/30"}`} />
            </div>
            <div>
              <h2 className="font-bold text-white">Google Drive</h2>
              <p className="text-sm text-white/40 mt-0.5">
                {isLoading ? "Checking connection..." :
                 isConnected ? `${documents.length} document${documents.length !== 1 ? "s" : ""} indexed` :
                 "Connect to sync your menu, FAQs, and knowledge docs"}
              </p>
            </div>
          </div>
          {!isLoading && (
            isConnected ? (
              <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </span>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 bg-white text-black font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Drive
              </button>
            )
          )}
        </div>
      </motion.div>

      {/* Sync config */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
      >
        <h2 className="font-bold text-white mb-1">Sync Configuration</h2>
        <p className="text-xs text-white/30 mb-5">Paste your Google Drive folder IDs below</p>

        <div className="space-y-2.5 mb-5">
          <AnimatePresence>
            {folderIds.map((id, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    value={id}
                    onChange={(e) => {
                      const newIds = [...folderIds];
                      newIds[i] = e.target.value;
                      setFolderIds(newIds);
                    }}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all font-mono text-xs"
                  />
                </div>
                {folderIds.length > 1 && (
                  <button
                    onClick={() => setFolderIds(folderIds.filter((_, j) => j !== i))}
                    className="text-white/20 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setFolderIds([...folderIds, ""])}
            className="flex items-center gap-1.5 text-xs text-indigo-400/70 hover:text-indigo-400 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add another folder
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing || !isConnected}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {isSyncing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Syncing...</>
            ) : (
              <><RefreshCw className="w-4 h-4" />Sync Now</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-white/20 mt-4">
          Find the folder ID in your Google Drive URL: drive.google.com/drive/folders/<strong className="text-white/30">THIS_IS_THE_ID</strong>
        </p>
      </motion.div>

      {/* Documents */}
      <AnimatePresence>
        {documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white">Indexed Documents</h2>
                <p className="text-xs text-white/30 mt-0.5">{documents.filter((d) => d.isIndexed).length} of {documents.length} indexed</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-medium">RAG Active</span>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                    <p className="text-[11px] text-white/25 mt-0.5">
                      {doc.mimeType?.split("/").pop()?.toUpperCase() || "DOC"} · {doc.size ? `${Math.round(doc.size / 1024)} KB` : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {doc.isIndexed ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Indexed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-white/25">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                    <span className={`text-[11px] font-medium ${SYNC_STATUS_CONFIG[doc.syncStatus]?.color || "text-white/30"}`}>
                      {SYNC_STATUS_CONFIG[doc.syncStatus]?.label || doc.syncStatus}
                    </span>
                    {doc.driveUrl && (
                      <a
                        href={doc.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/20 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
