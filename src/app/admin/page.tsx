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
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
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
  Users,
  Utensils,
  Wifi,
} from "lucide-react";
import { AdminDashboardData, MissingIconItem } from "@/lib/admin";
import { format, parseISO } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type AdminTab = "general" | "calendar" | "lunch" | "children";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300">Loading Dashboard Diagnostics & Housekeeping...</p>
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
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg">
              ⚙️
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
                Diagnostic audits, child profiles & schedules, 1-click icon approvals, and housekeeping for the next 30 days.
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

        {/* Row of Tabs */}
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
            {data.general.systemStatus === "warning" && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
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
            <span>Child Profiles & Schedules</span>
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
              <span className="px-1.5 py-0.2 rounded-full bg-blue-400 text-slate-950 text-[10px] font-black">
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
        </div>

        {/* Tab 1: General Overview */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Active Calendar Feeds</span>
                  <Radio className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{data.general.totalActiveFeeds} Feeds</div>
                <div className="text-[11px] text-emerald-400 font-bold mt-1">Live ICS feeds polling OK</div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Custom Event Rules</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{data.general.quickStats.activeEventRulesCount} Rules</div>
                <div className="text-[11px] text-slate-400 mt-1">Sports, schools, clinics & venues</div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">30-Day Activity Events</span>
                  <CalendarIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{data.general.quickStats.eventsInNext30Days} Events</div>
                <div className="text-[11px] text-blue-400 font-bold mt-1">
                  {data.calendar.evaluationWindow.eventsWithCustomIcons} branded / {data.calendar.evaluationWindow.eventsWithoutCustomIcons} unbranded
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">School Lunch Data</span>
                  <Utensils className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-black text-white truncate">{data.general.quickStats.lunchScheduleStatus}</div>
                <div className="text-[11px] text-emerald-400 font-bold mt-1">Clean formatting verified</div>
              </div>
            </div>

            {/* Dad's Checklist Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Dad&apos;s Housekeeping Checklist</h2>
                    <p className="text-xs text-slate-400">Essential configuration items to keep the dashboard 100% complete</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.calendar.dadChecklist.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      task.status === "done"
                        ? "bg-slate-900/40 border-slate-800/80 text-slate-400"
                        : "bg-amber-500/5 border-amber-500/30 text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5 ${
                          task.status === "done"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500 text-slate-950 font-black"
                        }`}
                      >
                        {task.status === "done" ? <Check className="w-3.5 h-3.5" /> : "!"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${task.status === "done" ? "line-through text-slate-500" : "text-white"}`}>
                            {task.title}
                          </span>
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
            </div>
          </div>
        )}

        {/* Tab 2: Child Profiles & Schedules (NEW!) */}
        {activeTab === "children" && (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Family Child Profiles & Schedule Hub</h2>
                    <p className="text-xs text-slate-400">
                      Central registry for schools, teachers, doctors, therapists, sports, and grandparent share links
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Child Profile Columns Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(data.childrenRegistry || []).map((child) => (
                  <div
                    key={child.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col space-y-4 shadow-sm"
                  >
                    {/* Header: Avatar + Name + Theme */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <div
                        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border-2 flex-shrink-0 shadow-md"
                        style={{ borderColor: child.color }}
                      >
                        <img
                          src={child.avatarIcon}
                          alt={child.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-white text-lg tracking-tight">{child.name}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{child.avatarTheme}</p>
                      </div>
                    </div>

                    {/* Metadata Attributes */}
                    <div className="space-y-2.5 text-xs">
                      {/* School & Grade */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mb-0.5">
                          <GraduationCap className="w-3 h-3 text-blue-400" />
                          School &amp; Grade
                        </span>
                        <div className="font-bold text-white">{child.school}</div>
                        <div className="text-amber-400 font-semibold">{child.grade}</div>
                      </div>

                      {/* Teacher */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mb-0.5">
                          <User className="w-3 h-3 text-emerald-400" />
                          Teacher / Homeroom
                        </span>
                        <div className="font-bold text-slate-200">{child.teacher}</div>
                      </div>

                      {/* Pediatrician & Specialists */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mb-0.5">
                          <HeartPulse className="w-3 h-3 text-rose-400" />
                          Medical &amp; Therapy
                        </span>
                        <div className="font-semibold text-slate-300">
                          {child.pediatrician !== "TBD" ? child.pediatrician : "Pediatrician: TBD"}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          Therapist: {child.therapist}
                        </div>
                      </div>

                      {/* Sports & Activities */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mb-0.5">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Primary Sport / Activity
                        </span>
                        <div className="font-bold text-amber-300">{child.primarySport}</div>
                      </div>

                      {/* Custody Rule */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1 mb-0.5">
                          <Home className="w-3 h-3 text-indigo-400" />
                          Custody Rule
                        </span>
                        <div className="font-semibold text-slate-300">{child.custody}</div>
                      </div>

                      {/* Integrated Schedule Links (For Grandparents & Family) */}
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-purple-400" />
                          Schedule &amp; Share Links
                        </span>
                        {child.scheduleLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all font-semibold text-[11px]"
                          >
                            <span className="truncate">{link.label}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Family Calendar Housekeeping */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            {/* Missing Icons Radar */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Missing Icons Radar (Next 30 Days)</h2>
                    <p className="text-xs text-slate-400">
                      Unbranded events detected on your calendar. Approve AI suggestions or paste custom logo URLs.
                    </p>
                  </div>
                </div>
              </div>

              {data.calendar.missingIcons.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white">All Events in Next 30 Days Are Branded!</p>
                  <p className="text-xs text-slate-400 mt-1">Every upcoming team, clinic, and school has a custom crest assigned.</p>
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

                        {/* AI Candidate Thumbnail Preview & 1-Click Action */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {item.suggestion?.candidateIconUrl && (
                            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 p-1 flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.suggestion.candidateIconUrl}
                                  alt={item.suggestion.category}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="text-left">
                                <div className="text-[11px] font-bold text-white">{item.suggestion.category}</div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                  {item.suggestion.sourceDomain || "Verified source"}
                                </div>
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

                      {/* Optional Custom Image URL input */}
                      {showCustomInput[item.id] && (
                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                          <input
                            type="url"
                            placeholder="Paste custom logo image URL (e.g. https://.../logo.png)"
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
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all disabled:opacity-50"
                          >
                            Apply Custom Logo
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Rules List */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Active Event Rules ({data.calendar.activeRules.length})</h2>
                    <p className="text-xs text-slate-400">Configured in config/event_rules.json</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.calendar.activeRules.map((rule) => (
                  <div key={rule.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                    {rule.iconUrl ? (
                      <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={rule.iconUrl} alt={rule.category} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <CalendarIcon className="w-5 h-5 text-slate-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-xs truncate">{rule.category}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Badge: <span className="text-amber-400">{rule.badgeText || "None"}</span>
                      </div>
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
                  <div>
                    <h2 className="text-lg font-black text-white">School Lunch 30-Day Coverage</h2>
                    <p className="text-xs text-slate-400">
                      Tracking loaded menus for Holliston Elementary and Middle Schools
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  {data.lunch.thirtyDaySchoolDaysCovered} / {data.lunch.thirtyDaySchoolDaysTotal} School Weekdays Loaded
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
