"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bot,
  Calendar as CalendarIcon,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dog,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
  HeartPulse,
  Home,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  MapPin,
  RefreshCw,
  School,
  Sparkles,
  Trophy,
  Upload,
  User,
  Users,
  Utensils,
} from "lucide-react";
import { format } from "date-fns";
import { AdminDashboardData, MissingIconItem } from "@/lib/admin";
import { ChildHeader } from "@/components/common/ChildHeader";
import { MarkdownViewer } from "@/components/common/MarkdownViewer";
import { PipelineTracker } from "@/components/admin/PipelineTracker";
import { AutomationArchitectureDiagram } from "@/components/admin/AutomationArchitectureDiagram";
import { useAuth } from "@/context/AuthContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AdminTab = "general" | "children" | "calendar" | "lunch" | "parent_info";

export default function AdminPage() {
  const { isAdmin, isLoading: isAuthLoading, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("general");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [customUrls, setCustomUrls] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});
  const [selectedParentDocId, setSelectedParentDocId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mascotError, setMascotError] = useState(false);

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
          summaryGroup: item.summaryGroup,
          iconUrl,
          category: item.suggestion?.category || item.summaryGroup,
          badgeText: item.suggestion?.badgeText || item.summaryGroup.slice(0, 12),
          childName: item.childName,
          ruleId: item.suggestion?.id || `rule-${item.id}`,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        showToast(`✅ Approved & applied icon for "${item.summaryGroup}"!`);
        mutate();
      } else {
        alert(`Failed to approve icon: ${result.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Network error approving icon: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300">Loading Dashboard Diagnostics &amp; Housekeeping...</p>
        </div>
      </div>
    );
  }

  // Auth Guard: Admin access strictly requires Dad (aswens@gmail.com) login
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-5">
          <div className="h-16 w-16 rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-lg mx-auto bg-amber-500/20 flex items-center justify-center">
            <img src="/scout.png" alt="Scout" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Dad Mode Restricted</h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Admin &amp; Housekeeping access is restricted to Dad (<span className="text-amber-300 font-mono">aswens@gmail.com</span>).
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={loginWithGoogle}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Sign In as Dad (aswens@gmail.com)</span>
            </button>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="glass-card p-6 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-black text-white">Diagnostics Unavailable</h2>
          <p className="text-xs text-slate-400 mt-2 mb-4">Could not retrieve system housekeeping state.</p>
          <button
            onClick={() => mutate()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const children = data.childrenRegistry || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-2xl flex items-center gap-2 transition-all duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header with Scout Mascot Image */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md flex-shrink-0 bg-amber-500/20 flex items-center justify-center">
              {!mascotError ? (
                <img
                  src="/scout.png"
                  alt="Scout the Beagle"
                  className="h-full w-full object-cover"
                  onError={() => setMascotError(true)}
                />
              ) : (
                <Dog className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
                  Scouty Planner • Admin &amp; Housekeeping
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
                  Dad Mode
                </span>
              </div>
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

        {/* Row of Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
              activeTab === "general"
                ? "bg-amber-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>General Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("children")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
              activeTab === "children"
                ? "bg-purple-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Child Profiles &amp; Schedules</span>
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
            {data.calendar.missingIcons.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-black">
                {data.calendar.missingIcons.length}
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
          </button>

          <button
            onClick={() => setActiveTab("parent_info")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex-shrink-0 ${
              activeTab === "parent_info"
                ? "bg-rose-600 text-white shadow-md font-black"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Parent Info</span>
          </button>
        </div>

        {/* Tab 1: General Overview (Housekeeping Items FIRST, No noisy feed metrics, No Gemini sanitizer) */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Last System Update & Deployment Telemetry */}
            <div className="glass-card p-6 border border-amber-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Last System Update</h2>
                    <p className="text-xs text-slate-400">CI/CD Pipeline Status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">Live CI/CD Active</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">Timestamp</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {data.general.lastSystemUpdate?.timestamp
                      ? (() => {
                          try {
                            return format(new Date(data.general.lastSystemUpdate.timestamp), "MMM d, yyyy • h:mm a");
                          } catch {
                            return data.general.lastSystemUpdate.timestamp;
                          }
                        })()
                      : "Unknown"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">Trigger &amp; Commit</span>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono text-amber-300 font-bold">
                      {data.general.lastSystemUpdate?.commitSha || "main"}
                    </span>
                    {data.general.lastSystemUpdate?.issueNumber && (
                      <a
                        href={`https://github.com/Swensation/swentonelli/issues/${data.general.lastSystemUpdate.issueNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        Issue #{data.general.lastSystemUpdate.issueNumber}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block mb-1 font-medium">Summary</span>
                  <span className="text-slate-200 truncate block font-medium">
                    {data.general.lastSystemUpdate?.summary || "Autonomous pipeline synchronized"}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Pipeline Tracker */}
            <PipelineTracker />

            {/* Living Automation Architecture Diagram (Invariant 7) */}
            <AutomationArchitectureDiagram />

            {/* 1. Pending Housekeeping Checklist */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">
                    Pending Housekeeping Items ({data.calendar.dadChecklist.length})
                  </h2>
                </div>
              </div>

              {data.calendar.dadChecklist.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white">All Housekeeping Tasks Complete! 🎉</p>
                  <p className="text-xs text-slate-400 mt-1">Every child avatar, team crest, and school rule is active.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.calendar.dadChecklist.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl border transition-all bg-amber-500/5 border-amber-500/30 text-slate-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 bg-amber-600 text-white">
                          !
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{task.title}</span>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {task.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Missing Icons Radar (Next 30 Days) */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">
                    Missing Icons Radar ({data.calendar.missingIcons.length})
                  </h2>
                </div>
              </div>

              {data.calendar.missingIcons.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white">All Events in Next 30 Days Are Branded!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.calendar.missingIcons.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-white text-base tracking-tight">{item.summaryGroup}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {item.countIn30Days} {item.countIn30Days === 1 ? "time" : "times"} in next 30d
                            </span>
                            {item.childName && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                {item.childName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Sample: <span className="text-slate-300 italic">&quot;{item.sampleEvents[0]}&quot;</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {item.suggestion?.candidateIconUrl && (
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.suggestion.candidateIconUrl}
                                  alt={item.suggestion.category}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="text-left">
                                <div className="text-[11px] font-bold text-white">{item.suggestion.category}</div>
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => handleApproveIcon(item)}
                            disabled={approvingId === item.id}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {approvingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Approve &amp; Apply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. School Lunch 30-Day Coverage */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">School Lunch Coverage</h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {data.lunch.thirtyDaySchoolDaysCovered} / {data.lunch.thirtyDaySchoolDaysTotal} School Days Loaded
                </span>
              </div>

              {data.lunch.upcomingMissingMonths.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Pending Monthly Menus:</span>
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
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Child Profiles & Schedules (Row Headers on Left Matrix Layout) */}
        {activeTab === "children" && (
          <div className="space-y-6">
            <div className="glass-card p-6 overflow-x-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">Child Profiles Matrix</h2>
                </div>
              </div>

              {/* Matrix Layout: Row Titles on the Left as Row Headers, 4 Child Columns on the Right */}
              <div className="min-w-[800px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="p-3 w-48 text-xs font-extrabold uppercase text-slate-500">
                        Attribute
                      </th>
                      {children.map((child) => (
                        <th key={child.id} className="p-3 min-w-[180px]">
                          <div
                            className="p-3 rounded-2xl bg-slate-900/90 border-2"
                            style={{ borderColor: `${child.color}99` }}
                          >
                            <ChildHeader child={child} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {/* Row 1: School */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        <span>School</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-200">
                          {c.school}
                        </td>
                      ))}
                    </tr>

                    {/* Row 2: Grade */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400">
                        <span>Grade</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-300">
                          {c.grade}
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Teacher / Homeroom */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span>Teacher / Homeroom</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-200">
                          {c.teacher}
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: Primary Sport / Activity */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Primary Sport</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-200">
                          {c.primarySport}
                        </td>
                      ))}
                    </tr>

                    {/* Row 5: Pediatrician */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400 flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-rose-400" />
                        <span>Pediatrician</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-300">
                          {c.pediatrician}
                        </td>
                      ))}
                    </tr>

                    {/* Row 6: Therapist */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400">
                        <span>Therapist</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-300">
                          {c.therapist}
                        </td>
                      ))}
                    </tr>

                    {/* Row 7: Custody Rule */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400 flex items-center gap-2">
                        <Home className="w-4 h-4 text-indigo-400" />
                        <span>Custody Rule</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 font-medium text-slate-300">
                          {c.custody}
                        </td>
                      ))}
                    </tr>

                    {/* Row 8: Schedule & Share Links */}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-400 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-purple-400" />
                        <span>Schedule Links</span>
                      </td>
                      {children.map((c) => (
                        <td key={c.id} className="p-3.5 space-y-1">
                          {c.scheduleLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-[11px]"
                            >
                              <span className="truncate">{link.label}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0 ml-1" />
                            </a>
                          ))}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Family Calendar (Vertical list of active event rules + matching criteria) */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Missing Icons Radar */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">
                    Missing Icons Radar ({data.calendar.missingIcons.length})
                  </h2>
                </div>
              </div>

              {data.calendar.missingIcons.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white">All Events in Next 30 Days Are Branded!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.calendar.missingIcons.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-white text-base tracking-tight">{item.summaryGroup}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {item.countIn30Days} {item.countIn30Days === 1 ? "time" : "times"} in next 30d
                            </span>
                            {item.childName && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                                {item.childName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Sample: <span className="text-slate-300 italic">&quot;{item.sampleEvents[0]}&quot;</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={() => handleApproveIcon(item)}
                            disabled={approvingId === item.id}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {approvingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Approve &amp; Apply</span>
                          </button>

                          <button
                            onClick={() =>
                              setShowCustomInput((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                          >
                            Custom URL
                          </button>
                        </div>
                      </div>

                      {showCustomInput[item.id] && (
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="Paste custom logo image URL"
                            value={customUrls[item.id] || ""}
                            onChange={(e) =>
                              setCustomUrls((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                          <button
                            onClick={() => handleApproveIcon(item, customUrls[item.id])}
                            disabled={!customUrls[item.id] || approvingId === item.id}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition-all disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Event Rules: Rendered as a Vertical List with Detailed Matching Criteria */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">
                    Active Event Rules ({data.calendar.activeRules.length})
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {data.calendar.activeRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Icon + Category + Assigned Child */}
                    <div className="flex items-center gap-3.5 min-w-0 md:w-1/3">
                      {rule.iconUrl ? (
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                          <img
                            src={rule.iconUrl}
                            alt={rule.category}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0">
                          <CalendarIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-black text-white text-sm tracking-tight truncate">
                          {rule.category}
                        </div>
                        {rule.childName ? (
                          <div className="text-[11px] font-bold text-purple-400 mt-0.5">
                            Child: {rule.childName}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 mt-0.5">All Children</div>
                        )}
                      </div>
                    </div>

                    {/* Middle / Right: Detailed Matching Criteria */}
                    <div className="flex-1 text-xs space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
                      {rule.summaryPatterns && rule.summaryPatterns.length > 0 && (
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-400">Matches Summary:</span>
                          {rule.summaryPatterns.map((pattern, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                            >
                              &quot;{pattern}&quot;
                            </span>
                          ))}
                        </div>
                      )}

                      {rule.descriptionPatterns && rule.descriptionPatterns.length > 0 && (
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-400">Matches Description:</span>
                          {rule.descriptionPatterns.map((pattern, idx) => (
                            <span
                              key={idx}
                              className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                            >
                              &quot;{pattern}&quot;
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: School Lunch Housekeeping */}
        {activeTab === "lunch" && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">School Lunch 30-Day Coverage</h2>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {data.lunch.thirtyDaySchoolDaysCovered} / {data.lunch.thirtyDaySchoolDaysTotal} School Days Loaded
                </span>
              </div>

              {data.lunch.upcomingMissingMonths.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Pending Monthly Menus:</span>
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
              )}
            </div>

            {/* Ingestion Steps */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black text-white">Monthly Ingestion Tool</h2>
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

        {/* Tab 5: Parent Information Handbook (Markdown-driven) */}
        {activeTab === "parent_info" && (
          <div className="space-y-6">
            {/* Quick Reference Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Standard Dismissal */}
              <div className="glass-card p-5 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Regular Dismissal</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                    Full Days
                  </span>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">Miller Elementary</span>
                      <span className="text-[11px] text-slate-400">Bennett</span>
                    </div>
                    <span className="font-black text-sm text-emerald-300 font-mono">2:18 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">Adams Middle School</span>
                      <span className="text-[11px] text-slate-400">Brighton</span>
                    </div>
                    <span className="font-black text-sm text-emerald-300 font-mono">3:03 PM</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Early Release Pickup */}
              <div className="glass-card p-5 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Early Release Pickup</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                    Half Days
                  </span>
                </div>
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">Miller Elementary (Stop 1)</span>
                      <span className="text-[11px] text-slate-400">Bennett (Grades 3–5)</span>
                    </div>
                    <span className="font-black text-sm text-amber-300 font-mono">10:47 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="font-bold text-white block">Adams Middle School (Stop 2)</span>
                      <span className="text-[11px] text-slate-400">Brighton (Grades 6–8)</span>
                    </div>
                    <span className="font-black text-sm text-amber-300 font-mono">11:32 AM</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Departure Recommendation */}
              <div className="glass-card p-5 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4" />
                    <span>Recommended Departure</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-500/30">
                    Leave House
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-100 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-white font-mono">10:20 AM – 10:30 AM</span>
                  </div>
                  <p className="text-[11px] text-sky-200/80 leading-relaxed">
                    Leaves time to pick up Bennett at Miller (10:47 AM) and proceed to Adams for Brighton (11:32 AM).
                  </p>
                </div>
              </div>
            </div>

            {/* Document Selector (if multiple docs exist) */}
            {data.parentInfo && data.parentInfo.documents.length > 1 && (
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 px-3">Documents:</span>
                {data.parentInfo.documents.map((doc) => {
                  const currentId = selectedParentDocId || data.parentInfo.documents[0]?.id;
                  const isSelected = currentId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedParentDocId(doc.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                        isSelected
                          ? "bg-rose-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{doc.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Selected Markdown Document */}
            {(() => {
              const docs = data.parentInfo?.documents || [];
              const activeDoc = docs.find((d) => d.id === selectedParentDocId) || docs[0];

              if (!activeDoc) {
                return (
                  <div className="glass-card p-8 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="font-bold text-white">No Parent Information Documents Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add <span className="font-mono text-amber-400">docs/parent-info/school-hours.md</span> to display markdown here.
                    </p>
                  </div>
                );
              }

              return (
                <MarkdownViewer
                  content={activeDoc.content}
                  title={activeDoc.title}
                  filename={activeDoc.filename}
                  lastModified={activeDoc.lastModified}
                />
              );
            })()}

            {/* Extensibility Info Box */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
              <div className="p-2 rounded-xl bg-slate-800 text-amber-400 flex-shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-200">Repository Markdown Sync</span>
                <p>
                  All markdown documents placed in <span className="font-mono text-amber-400">docs/parent-info/*.md</span> in this repository are automatically discovered, parsed, and rendered here for quick reference.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
