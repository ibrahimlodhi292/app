"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Clock, Loader2, Save, Sliders, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { type AdminSettings } from "@/types";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${
        checked ? "bg-indigo-500" : "bg-white/10"
      }`}
    >
      <motion.span
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm block"
      />
    </button>
  );
}

function SectionCard({ icon: Icon, title, delay, children }: {
  icon: React.ElementType;
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0 }}
      className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-indigo-400" />
        </div>
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<AdminSettings>>({
    welcomeMessage: "",
    aiPersonality: "",
    systemPrompt: "",
    autoSync: false,
    syncIntervalMinutes: 60,
    maxConversationLength: 50,
    escalationThreshold: 3,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.data) setSettings(data.data);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        toast.success("Settings saved");
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl space-y-6">
        <div>
          <div className="w-32 h-7 bg-white/[0.06] rounded-lg animate-pulse mb-2" />
          <div className="w-64 h-4 bg-white/[0.04] rounded animate-pulse" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-6 animate-pulse">
            <div className="w-40 h-5 bg-white/[0.06] rounded mb-5" />
            <div className="space-y-3">
              <div className="w-full h-10 bg-white/[0.04] rounded-xl" />
              <div className="w-full h-20 bg-white/[0.04] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-white/35 mt-1 text-sm">Configure your AI assistant and automation</p>
      </motion.div>

      {/* AI Personality */}
      <SectionCard icon={Bot} title="AI Personality" delay={0.05}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">Welcome Message</label>
            <input
              value={settings.welcomeMessage || ""}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              placeholder="Welcome! How can I help you today?"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">Personality Description</label>
            <textarea
              value={settings.aiPersonality || ""}
              onChange={(e) => setSettings({ ...settings, aiPersonality: e.target.value })}
              rows={3}
              placeholder="Friendly and professional restaurant assistant..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">
              Custom System Prompt
              <span className="ml-2 text-[10px] text-white/20 font-normal">Advanced</span>
            </label>
            <textarea
              value={settings.systemPrompt || ""}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              rows={5}
              placeholder="Additional instructions for the AI..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all resize-none font-mono leading-relaxed"
            />
          </div>
        </div>
      </SectionCard>

      {/* Behavior */}
      <SectionCard icon={Sliders} title="AI Behavior" delay={0.1}>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">Max Conversation Length</label>
            <input
              type="number" min={10} max={200}
              value={settings.maxConversationLength || 50}
              onChange={(e) => setSettings({ ...settings, maxConversationLength: Number(e.target.value) })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all"
            />
            <p className="text-[10px] text-white/20 mt-1.5">messages before auto-summary</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-2">Escalate After</label>
            <input
              type="number" min={1} max={10}
              value={settings.escalationThreshold || 3}
              onChange={(e) => setSettings({ ...settings, escalationThreshold: Number(e.target.value) })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all"
            />
            <p className="text-[10px] text-white/20 mt-1.5">unanswered questions</p>
          </div>
        </div>
      </SectionCard>

      {/* Auto-Sync */}
      <SectionCard icon={Clock} title="Auto-Sync" delay={0.15}>
        <div className="flex items-center justify-between py-2 mb-4">
          <div>
            <p className="text-sm font-medium text-white">Enable Auto-Sync</p>
            <p className="text-xs text-white/30 mt-0.5">Automatically sync Google Drive documents on schedule</p>
          </div>
          <Toggle
            checked={settings.autoSync || false}
            onChange={() => setSettings({ ...settings, autoSync: !settings.autoSync })}
          />
        </div>

        <AnimatePresence>
          {settings.autoSync && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/[0.05] pt-4"
            >
              <label className="block text-xs font-semibold text-white/50 mb-2">Sync Interval (minutes)</label>
              <input
                type="number" min={15} max={1440}
                value={settings.syncIntervalMinutes || 60}
                onChange={(e) => setSettings({ ...settings, syncIntervalMinutes: Number(e.target.value) })}
                className="w-36 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/40 transition-all"
              />
              <p className="text-[10px] text-white/20 mt-1.5">minimum 15 minutes</p>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Save */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 font-semibold px-8 py-3 rounded-xl transition-all ${
            saved
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
              : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 shadow-lg disabled:opacity-50"
          }`}
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
          ) : saved ? (
            <><Zap className="w-4 h-4" />Saved!</>
          ) : (
            <><Save className="w-4 h-4" />Save Settings</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
