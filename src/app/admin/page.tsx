"use client";

import useSWR from "swr";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Dog,
  FileText,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Trophy,
  Upload,
  User,
  Utensils,
} from "lucide-react";
import { AdminDashboardData } from "@/lib/admin";
import { format, parseISO } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const { data, error, isLoading } = useSWR<AdminDashboardData>("/api/admin", fetcher, {
    revalidateOnFocus: true,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 bg-ambient font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header Ribbon */}
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
                  Scouty Planner • Housekeeping & Admin
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
                  Dad Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Diagnostic warnings for upcoming events strictly within the next 30 days.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-all shadow-sm active:scale-95 text-xs md:text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Dashboard</span>
          </Link>
        </header>

        {isLoading && !data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-96 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
            <div className="lg:col-span-5 h-96 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800" />
          </div>
        )}

        {error && (
          <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
            Failed to load administration diagnostic data.
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (7 Cols): Family Calendar Housekeeping */}
            <div className="lg:col-span-7 space-y-6">
              {/* Panel 1: Active Business Rules */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Active Event Rules</h2>
                      <p className="text-xs text-slate-400">Explicit custom rules configured in config/event_rules.json</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {data.calendar.activeRules.length} Active
                  </span>
                </div>

                <div className="space-y-3">
                  {data.calendar.activeRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-4"
                    >
                      {rule.iconUrl && (
                        <div className="w-14 h-14 rounded-2xl bg-white/10 p-2 border border-slate-700 flex-shrink-0 flex items-center justify-center shadow-md">
                          <img
                            src={rule.iconUrl}
                            alt={rule.badgeText || "Crest"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-white text-base">
                            {rule.childName ? `${rule.childName} • ` : ""}
                            {rule.category}
                          </h4>
                          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {rule.badgeText}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-400 space-y-1">
                          <p>
                            <span className="text-slate-500 font-semibold">Summary Triggers:</span>{" "}
                            <span className="font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                              {rule.summaryPatterns?.join(", ") || "None"}
                            </span>
                          </p>
                          {rule.descriptionPatterns && (
                            <p>
                              <span className="text-slate-500 font-semibold">Desc Triggers:</span>{" "}
                              <span className="font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                                {rule.descriptionPatterns.join(", ")}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 2: Missing Icons Radar (Next 30 Days Only) */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">Missing Icons Radar</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          Events in next 30 days falling back to generic calendar icon
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {data.calendar.evaluationWindow.totalEventsInWindow} events in 30d window
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {data.calendar.missingIconCategories.length} Categories Needed
                  </span>
                </div>

                <div className="space-y-4">
                  {data.calendar.missingIconCategories.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All recurring events in the next 30 days have custom icons configured!</span>
                    </div>
                  ) : (
                    data.calendar.missingIconCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
                              {cat.name}
                              {cat.child && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {cat.child}
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">{cat.description}</p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {cat.suggestedIconPath}
                          </span>
                        </div>

                        {/* Sample Detected Events */}
                        {cat.sampleEvents.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-1">
                              Sample Live Events in Next 30 Days:
                            </span>
                            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                              {cat.sampleEvents.map((ev, i) => (
                                <li key={i} className="truncate">{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{cat.actionNeeded}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Panel 3: Missing Details Warnings (e.g. Missing Locations in next 30 days) */}
              {data.calendar.missingDetailsWarnings.length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white">Missing Event Details Radar</h2>
                        <p className="text-xs text-slate-400">
                          Games, matches, or appointments in next 30 days missing locations
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {data.calendar.missingDetailsWarnings.length} Flagged
                    </span>
                  </div>

                  <div className="space-y-3">
                    {data.calendar.missingDetailsWarnings.map((warn) => (
                      <div
                        key={warn.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-sm">{warn.eventSummary}</span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {format(parseISO(warn.eventDate), "EEE, MMM d")}
                          </span>
                        </div>
                        <p className="text-rose-400 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{warn.detail}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Panel 4: Dad's Housekeeping Checklist */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-700/60 mb-4">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Dad&apos;s Housekeeping Checklist</h2>
                    <p className="text-xs text-slate-400">Pending tasks to polish and tighten the dashboard</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {data.calendar.dadChecklist.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
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
                          <h5 className="font-bold text-xs md:text-sm">{task.title}</h5>
                          <p className="text-[11px] text-slate-400">{task.description}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
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
            </div>

            {/* RIGHT COLUMN (5 Cols): School Lunch Housekeeping */}
            <div className="lg:col-span-5 space-y-6">
              {/* Panel 1: Monthly Menu Coverage */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">School Lunch Coverage</h2>
                      <p className="text-xs text-slate-400">Schedule status across academic months</p>
                    </div>
                  </div>
                </div>

                {/* Active Month Card */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Loaded Schedule</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Loaded
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{data.lunch.activeMonth}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-300 font-mono">
                    <span>{data.lunch.totalDays} Days Parsed</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">100% Clean Strings</span>
                  </div>
                </div>

                {/* Upcoming Missing Months Alert */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Upcoming Missing Months (Action Needed)</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">
                    As school resumes in Fall 2026, the following months do not have PDF lunch calendars loaded:
                  </p>
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

                {/* Configured Schools */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-1">
                    Configured School Feeds:
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {data.lunch.schoolFeedsConfigured.map((school, i) => (
                      <li key={i}>{school}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Panel 2: PDF Ingestion Guide */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-700/60 mb-4">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Monthly Ingestion Guide</h2>
                    <p className="text-xs text-slate-400">How to add upcoming school lunch calendars</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-white block mb-1">Step 1: Download School PDF</span>
                    <p className="text-slate-400">
                      Download the monthly lunch calendar PDF from the Holliston school district website or Nutrislice.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-white block mb-1">Step 2: Save to Project</span>
                    <p className="text-slate-400">
                      Save file as <span className="font-mono text-amber-400">data/september_2026.pdf</span>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-white block mb-1">Step 3: Trigger Ingestion</span>
                    <p className="text-slate-400">
                      Ask Antigravity: <span className="text-white italic">&quot;Parse september_2026.pdf for school lunch&quot;</span>. Antigravity will extract the grid, clean tags, update <span className="font-mono text-amber-400">data/lunch_schedule.json</span>, and run the test suite!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
