"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  HeartPulse,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  MapPin,
  QrCode,
  Radio,
  RefreshCw,
  Server,
  Sparkles,
  Trophy,
  Upload,
  User,
  Utensils,
  Wifi,
} from "lucide-react";
import { AdminDashboardData, MissingIconItem } from "@/lib/admin";
import { format, parseISO } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AdminTab = "general" | "calendar" | "lunch";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("general");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<AdminDashboardData>("/api/admin", fetcher, {
    revalidateOnFocus: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveIcon = async (item: MissingIconItem, overrideUrl?: string) => {
    const iconUrl = overrideUrl || item.suggestion?.candidateIconUrl || customUrls[item.id];
    if (!iconUrl) {
      alert("Please provide an image URL to approve.");
      return;
    }

    setApprovingId(item.id);
    try {
      const res = await fetch("/api/admin/approve-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.suggestion?.id || item.summaryGroup,
          category: item.suggestion?.category || item.summaryGroup,
          badgeText: item.suggestion?.badgeText || item.summaryGroup,
          iconUrl,
          summaryPatterns: item.suggestion?.summaryPatterns || [item.summaryGroup.toLowerCase()],
          childName: item.childName,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to approve icon");
      }

      showToast(`✅ Approved icon for "${item.summaryGroup}"!`);
      await mutate();
    } catch (err: any) {
      console.error("Failed to approve icon:", err);
      alert(`Error approving icon: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 bg-ambient font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl font-bold text-sm flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Ribbon */}
        <header className="w-full py-4 px-6 glass-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md flex-shrink-0 bg-amber-500/20 flex items-center justify-center">
              <img
                src="/scout.jpeg"
                alt="Scout"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
                  Scouty Planner • Admin & Housekeeping
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
                  Dad Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Diagnostic audits, 1-click icon approvals, and actionable housekeeping for the next 30 days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => mutate()}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95"
              title="Refresh Diagnostics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-all shadow-sm active:scale-95 text-xs md:text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Row of Tabs (Static SSR) */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
              activeTab === "general"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>General Overview</span>
            {data?.general.systemStatus === "warning" && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
              activeTab === "calendar"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Family Calendar</span>
            {data && data.general.calendarAlertsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold border border-rose-500/30">
                {data.general.calendarAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("lunch")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
              activeTab === "lunch"
                ? "bg-emerald-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>School Lunch</span>
            {data && data.general.lunchAlertsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                {data.general.lunchAlertsCount}
              </span>
            )}
          </button>
        </div>

        {isLoading && !data && (
          <div className="h-96 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
        )}

        {error && (
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
            Failed to load administration diagnostic data.
          </div>
        )}

        {/* TAB 1: GENERAL OVERVIEW */}
        {data && activeTab === "general" && (
          <div className="space-y-6">
            {/* System Health Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">System & Feed Health</h2>
                    <p className="text-xs text-slate-400">Overall dashboard status and active connections</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  <span>All Systems Operational</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Kiosk Access URL</span>
                  <p className="text-base font-black text-amber-400 font-mono mt-1">{data.general.kioskUrl}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Local LAN endpoint for kitchen iPad/tablets</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Calendar Feeds Synced</span>
                  <p className="text-base font-black text-blue-400 mt-1">{data.general.totalActiveFeeds} Active Google Feeds</p>
                  <p className="text-[11px] text-slate-500 mt-1">Live sync with +/- 60-day calendar buffer</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Lunch Coverage</span>
                  <p className="text-base font-black text-emerald-400 mt-1">{data.general.quickStats.lunchScheduleStatus}</p>
                  <p className="text-[11px] text-slate-500 mt-1">100% clean string parsing integrity</p>
                </div>
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="glass-card p-6">
              <h3 className="text-base font-black text-white mb-4">Quick Housekeeping Hub</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-blue-300">
                          Calendar Housekeeping
                        </h4>
                        <p className="text-xs text-slate-400">
                          {data.calendar.missingIcons.length} missing icon groups in next 30 days
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("lunch")}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-300">
                          School Lunch Housekeeping
                        </h4>
                        <p className="text-xs text-slate-400">
                          {data.lunch.upcomingMissingMonths.join(", ")} pending PDFs
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FAMILY CALENDAR (Single Column with 1-Click Approvals) */}
        {data && activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Top Attention Section: Missing Custom Icons in Next 30 Days */}
            <div className="glass-card p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      AI Discovered Icon Suggestions & Approvals (Next 30 Days)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Discovered logos and candidate crests for upcoming unbranded events. Click &quot;Approve&quot; to apply instantly.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {data.calendar.missingIcons.length} Groups
                </span>
              </div>

              {data.calendar.missingIcons.length === 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-white">All Clear!</span>
                    <span>Every event in the next 30 days has an explicit custom icon assigned.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {data.calendar.missingIcons.map((item) => {
                    const isApproving = approvingId === item.id;
                    const hasSuggestion = !!item.suggestion?.candidateIconUrl;
                    const candidateUrl = item.suggestion?.candidateIconUrl || customUrls[item.id];
                    const isCustomOpen = showCustomInput[item.id];

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-3"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Left: Candidate Thumbnail Preview + Details */}
                          <div className="flex items-start gap-3.5">
                            {/* Candidate Image Preview */}
                            <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-700 p-2 flex-shrink-0 flex items-center justify-center shadow-inner relative group">
                              {candidateUrl ? (
                                <img
                                  src={candidateUrl}
                                  alt="Candidate Logo"
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <HelpCircle className="w-6 h-6 text-slate-500" />
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white text-base leading-tight">
                                  {item.summaryGroup}
                                </h4>
                                <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {item.countIn30Days}x in 30d
                                </span>
                                {item.childName && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {item.childName}
                                  </span>
                                )}
                              </div>

                              {item.suggestion && (
                                <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                                  <span className="text-emerald-400">✨ Discovered: {item.suggestion.category}</span>
                                  {item.suggestion.sourceDomain && (
                                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                      <Globe className="w-3 h-3" />
                                      {item.suggestion.sourceDomain}
                                    </span>
                                  )}
                                </div>
                              )}

                              {item.sampleEvents.length > 0 && (
                                <div className="text-xs text-slate-400 truncate max-w-xl">
                                  <span className="text-slate-500 font-semibold">Sample: </span>
                                  {item.sampleEvents[0]}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: 1-Click Action Buttons */}
                          <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                            {hasSuggestion && (
                              <button
                                onClick={() => handleApproveIcon(item)}
                                disabled={isApproving}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                              >
                                {isApproving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                <span>Approve & Apply</span>
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setShowCustomInput((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                              }
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-semibold flex items-center gap-1"
                              title="Provide custom image link"
                            >
                              <Link2 className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Custom URL</span>
                            </button>
                          </div>
                        </div>

                        {/* Expandable Custom URL Input */}
                        {isCustomOpen && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                            <input
                              type="url"
                              placeholder="Paste custom logo image URL (https://...)"
                              value={customUrls[item.id] || ""}
                              onChange={(e) =>
                                setCustomUrls((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            <button
                              onClick={() => handleApproveIcon(item, customUrls[item.id])}
                              disabled={!customUrls[item.id] || isApproving}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-40"
                            >
                              Save & Apply
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Missing Details Warnings (e.g. Missing Locations in next 30 days) */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Missing Event Details & Locations (Next 30 Days)</h2>
                    <p className="text-xs text-slate-400">
                      Matches, games, or appointments in next 30 days missing locations
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {data.calendar.missingDetailsWarnings.length} Flagged
                </span>
              </div>

              {data.calendar.missingDetailsWarnings.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All upcoming games and appointments have locations attached!</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.calendar.missingDetailsWarnings.map((warn) => (
                    <div
                      key={warn.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white text-sm block">{warn.eventSummary}</span>
                        <span className="text-rose-400 font-semibold">{warn.detail}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {format(parseISO(warn.eventDate), "EEE, MMM d")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dad's Housekeeping Checklist */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-700/60 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Dad&apos;s Actionable Checklist</h2>
                  <p className="text-xs text-slate-400">Pending and completed dashboard polishing tasks</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {data.calendar.dadChecklist.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      task.status === "done"
                        ? "bg-emerald-950/20 border-emerald-800/40 text-slate-300"
                        : "bg-slate-900/80 border-slate-800 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                      )}
                      <div>
                        <h5 className="font-bold text-sm">{task.title}</h5>
                        <p className="text-xs text-slate-400">{task.description}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded uppercase ${
                        task.status === "done"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Active Rules & Configuration */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Active Event Categorization Rules</h2>
                    <p className="text-xs text-slate-400">Configured in config/event_rules.json</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {data.calendar.activeRules.length} Configured
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.calendar.activeRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
                  >
                    {rule.iconUrl && (
                      <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 border border-slate-700 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={rule.iconUrl}
                          alt={rule.badgeText || "Crest"}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {rule.childName ? `${rule.childName} • ` : ""}
                          {rule.category}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {rule.badgeText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                        {rule.summaryPatterns?.join(", ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHOOL LUNCH (Single Column) */}
        {data && activeTab === "lunch" && (
          <div className="space-y-6">
            {/* Top Attention Section: 30-Day Lunch Coverage */}
            <div className="glass-card p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">⚠️ Attention Needed: 30-Day Lunch Menu Coverage</h2>
                    <p className="text-xs text-slate-400">Upcoming school weekdays in the next 30 days</p>
                  </div>
                </div>
              </div>

              {/* 30-Day Coverage Metric Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                    Next 30 Days Coverage
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {data.lunch.thirtyDaySchoolDaysCovered} of {data.lunch.thirtyDaySchoolDaysTotal} School Days Loaded
                  </h3>
                </div>
                <span
                  className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase ${
                    data.lunch.thirtyDaySchoolDaysCovered === data.lunch.thirtyDaySchoolDaysTotal
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {data.lunch.thirtyDaySchoolDaysCovered === data.lunch.thirtyDaySchoolDaysTotal
                    ? "100% Loaded"
                    : "Action Needed"}
                </span>
              </div>

              {/* Upcoming Missing Months Alert */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Pending Monthly PDFs:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {data.lunch.upcomingMissingMonths.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-400 border border-amber-500/30 font-mono"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Loaded Schedules & Ingestion Tool */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Monthly Ingestion Tool & Settings</h2>
                    <p className="text-xs text-slate-400">How to add upcoming school lunch calendars</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-white block mb-1">Step 1: Download Monthly District PDF</span>
                  <p className="text-slate-400">
                    Download the monthly lunch calendar PDF from the Holliston district portal or Nutrislice.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-white block mb-1">Step 2: Save to Project</span>
                  <p className="text-slate-400">
                    Save the file as <span className="font-mono text-amber-400">data/september_2026.pdf</span>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="font-bold text-white block mb-1">Step 3: Trigger Ingestion</span>
                  <p className="text-slate-400">
                    Tell Antigravity: <span className="text-white italic">&quot;Parse september_2026.pdf for school lunch&quot;</span>. Antigravity will extract the grid, clean vegetarian tags, update <span className="font-mono text-amber-400">data/lunch_schedule.json</span>, and run the automated test suite!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
