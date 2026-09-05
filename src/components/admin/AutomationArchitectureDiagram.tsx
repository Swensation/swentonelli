"use client";

import { useState } from "react";
import {
  ArrowDown,
  Calendar,
  CheckCircle2,
  Copy,
  Home,
  Layers,
  Mic,
  Utensils,
} from "lucide-react";

export interface PipelineFlow {
  id: string;
  name: string;
  icon: any;
  origin: { title: string; actor: string };
  staging: { title: string; uri: string };
  trigger: { title: string; cadence: string };
  processor: { script: string; rules: string };
  result: { title: string; target: string };
}

export const PIPELINES: PipelineFlow[] = [
  {
    id: "plaud-tasks",
    name: "Voice Notes → Google Tasks",
    icon: Mic,
    origin: { title: "Spoken Memo", actor: "Plaud Note Hardware" },
    staging: { title: "Plaud Cloud API", uri: "platform.plaud.ai" },
    trigger: { title: "Cloud Scheduler", cadence: "Every 10m / Manual" },
    processor: {
      script: "sync-plaud-tasks.ts",
      rules: "Filter #work • Dedup ledger • Match family name",
    },
    result: { title: "Google Task", target: "Dad's Google Account" },
  },
  {
    id: "calendar-custody",
    name: "Calendars & Custody",
    icon: Calendar,
    origin: { title: "Schedule Event", actor: "Google Cal / TeamSnap" },
    staging: { title: "4 Live ICS Feeds", uri: "Aria/Ben, Brighton/Bennett, Andrew, OSFC" },
    trigger: { title: "Hourly Cache / Refresh", cadence: "Automated / Kiosk Load" },
    processor: {
      script: "calendar.ts & eventRules.ts",
      rules: "30-day window • Custody rotation • Sports crests",
    },
    result: { title: "Unified Timeline", target: "Dashboard & Kiosk" },
  },
  {
    id: "school-lunch",
    name: "School Lunch",
    icon: Utensils,
    origin: { title: "Monthly Menu", actor: "District Food Services" },
    staging: { title: "District Dataset", uri: "lunch_menu_september_2026.json" },
    trigger: { title: "Daily Midnight", cadence: "Automated daily" },
    processor: {
      script: "lunch.ts",
      rules: "School isolation • Holiday checks • Hot meals",
    },
    result: { title: "Lunch Badges", target: "Child Schedule Cards" },
  },
  {
    id: "house-systems",
    name: "House Telemetry",
    icon: Home,
    origin: { title: "HVAC / Sensor State", actor: "10 Bullard Lane Hardware" },
    staging: { title: "SmartThings API", uri: "api.smartthings.com" },
    trigger: { title: "Polling Loop", cadence: "Every 30s / On View" },
    processor: {
      script: "houseSystems.ts",
      rules: "Token refresh • Telemetry extract • Fault checks",
    },
    result: { title: "Live Status & Alerts", target: "Systems Widget" },
  },
];

const MERMAID_SPEC = `flowchart LR
    O1["Plaud Memo"] --> U1["Plaud API"] --> T1["Scheduler (10m)"] --> P1["sync-plaud-tasks.ts"] --> R1["Google Tasks"]
    O2["Cal Event"] --> U2["4 ICS Feeds"] --> T1 --> P2["calendar.ts"] --> R2["Custody Timeline"]
    O3["Lunch PDF"] --> U3["Menu JSON"] --> T1 --> P3["lunch.ts"] --> R3["Lunch Badges"]
    O4["HVAC State"] --> U4["SmartThings API"] --> T1 --> P4["houseSystems.ts"] --> R4["Systems Widget"]`;

export function AutomationArchitectureDiagram() {
  const [activeId, setActiveId] = useState("plaud-tasks");
  const [viewMode, setViewMode] = useState<"flow" | "trace" | "mermaid">("flow");
  const [copied, setCopied] = useState(false);

  const active = PIPELINES.find((p) => p.id === activeId) || PIPELINES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(MERMAID_SPEC);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 border border-emerald-500/30">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-700/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Automation Architecture</h2>
            <p className="text-xs text-slate-400">5-stage causal trace from origin to result</p>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode("flow")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "flow" ? "bg-emerald-600 text-white font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Flow
          </button>
          <button
            type="button"
            onClick={() => setViewMode("trace")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "trace" ? "bg-emerald-600 text-white font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Reverse Trace
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mermaid")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === "mermaid" ? "bg-emerald-600 text-white font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Mermaid
          </button>
        </div>
      </div>

      {/* Pipeline Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
        {PIPELINES.map((p) => {
          const Icon = p.icon;
          const isSelected = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 border cursor-pointer ${
                isSelected
                  ? "bg-slate-800 border-emerald-500/60 text-white shadow font-black"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mode 1: 5-Stage Causal Flow */}
      {viewMode === "flow" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 text-xs">
          {/* Stage 1 */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                1. Origin
              </span>
              <h4 className="font-bold text-white mb-0.5">{active.origin.title}</h4>
              <p className="text-[11px] text-slate-400">{active.origin.actor}</p>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                2. Staging
              </span>
              <h4 className="font-bold text-white mb-0.5">{active.staging.title}</h4>
              <p className="text-[11px] font-mono text-slate-400 truncate">{active.staging.uri}</p>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">
                3. Trigger
              </span>
              <h4 className="font-bold text-white mb-0.5">{active.trigger.title}</h4>
              <p className="text-[11px] text-emerald-300/80 font-medium">{active.trigger.cadence}</p>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                4. Processing
              </span>
              <h4 className="font-mono text-amber-300 font-bold text-[11px] mb-1">
                {active.processor.script}
              </h4>
              <p className="text-[11px] text-slate-300">{active.processor.rules}</p>
            </div>
          </div>

          {/* Stage 5 */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">
                5. Result
              </span>
              <h4 className="font-bold text-white mb-0.5">{active.result.title}</h4>
              <p className="text-[11px] text-emerald-300/90 font-medium">{active.result.target}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Reverse Trace View */}
      {viewMode === "trace" && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          {/* Result */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-black text-[10px]">
              RESULT
            </span>
            <span className="font-bold text-white flex-1">{active.result.title}</span>
            <span className="text-slate-400 text-[11px]">{active.result.target}</span>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
          </div>

          {/* Processor */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-black text-[10px]">
              PROCESSOR
            </span>
            <span className="font-mono text-amber-300 font-bold flex-1">{active.processor.script}</span>
            <span className="text-slate-400 text-[11px]">{active.processor.rules}</span>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
          </div>

          {/* Trigger */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-black text-[10px]">
              TRIGGER
            </span>
            <span className="font-bold text-white flex-1">{active.trigger.title}</span>
            <span className="text-emerald-400 text-[11px] font-mono">{active.trigger.cadence}</span>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
          </div>

          {/* Staging */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-black text-[10px]">
              STAGING
            </span>
            <span className="font-bold text-white flex-1">{active.staging.title}</span>
            <span className="font-mono text-slate-400 text-[11px]">{active.staging.uri}</span>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
          </div>

          {/* Origin */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-black text-[10px]">
              ORIGIN
            </span>
            <span className="font-bold text-white flex-1">{active.origin.title}</span>
            <span className="text-slate-400 text-[11px]">{active.origin.actor}</span>
          </div>
        </div>
      )}

      {/* Mode 3: Mermaid View */}
      {viewMode === "mermaid" && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Mermaid</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300/90 overflow-x-auto">
            {MERMAID_SPEC}
          </pre>
        </div>
      )}
    </div>
  );
}
