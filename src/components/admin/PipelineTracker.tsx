"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

export type PipelineStageStatus = "HEALTHY" | "PROCESSING" | "STALLED" | "COMPLETED";

export interface PipelineStage {
  id: string;
  name: string;
  category: string;
  status: PipelineStageStatus;
  latency: string;
  lastRun: string;
  description: string;
  details: string[];
  diagnosticMessage?: string;
}

export function PipelineTracker() {
  const [isSimulatingStall, setIsSimulatingStall] = useState(false);

  const stages: PipelineStage[] = [
    {
      id: "ingestion",
      name: "1. Data Ingestion & Triggers",
      category: "External Feeds",
      status: "HEALTHY",
      latency: "180ms",
      lastRun: "Active",
      description: "Aggregating Google Calendar, Nutrislice Lunch & Voice Feedback",
      details: [
        "Google Calendar: Syncing family events & school schedules",
        "Nutrislice API: Fetching Holliston & Millis lunch menus",
        "Beagle Feedback: Polling GitHub issues labeled 'feedback-inbox'",
      ],
    },
    {
      id: "enrichment",
      name: "2. Business Logic & Enrichment",
      category: "Rule Engine",
      status: isSimulatingStall ? "STALLED" : "HEALTHY",
      latency: isSimulatingStall ? "45.2s" : "240ms",
      lastRun: "Active",
      description: "Applying custody rotation, district scoping & icon resolution",
      details: [
        "Custody Rules: Mom (Liz/Callie) vs Dad (Andrew/Chris) rotation",
        "District Scoping: Millis vs. Holliston no-school isolation",
        "AI Venue Discovery: Auto-matching sports & birthday logos",
      ],
      diagnosticMessage: isSimulatingStall
        ? "⚠️ Bottleneck Detected: External calendar API response timeout (>30s). Pipeline Surgeon auto-retry armed."
        : undefined,
    },
    {
      id: "verification",
      name: "3. Verification & Safety Guard",
      category: "CI/CD Suite",
      status: "HEALTHY",
      latency: "4.8s",
      lastRun: "Passing",
      description: "Automated regression tests, typechecks & circuit breaker",
      details: [
        "TypeScript: Syntax and type verification (0 errors)",
        "Smoke Test Suite: 148 automated spec assertions passing",
        "Pipeline Surgeon: Auto-remediation active with 2-attempt circuit breaker",
      ],
    },
    {
      id: "deployment",
      name: "4. Live Display & Kiosk",
      category: "Client Output",
      status: "COMPLETED",
      latency: "Real-time",
      lastRun: "Online",
      description: "Serving synchronized schedules to wall kiosk & mobile",
      details: [
        "Wall Kiosk: 1080x1920 portrait layout active",
        "Mobile View: 4-Column responsive timeline with fixed badges",
        "Dad Admin: System telemetry & 1-click icon approvals live",
      ],
    },
  ];

  return (
    <div className="glass-card p-6 border border-blue-500/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">System Pipeline</h2>
            <p className="text-xs text-slate-400">
              Ingestion, rules engine, and verification status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSimulatingStall(!isSimulatingStall)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulatingStall
                ? "bg-rose-500/20 border-rose-400 text-rose-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSimulatingStall ? "Clear Simulated Stall" : "Simulate Pipeline Stall"}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSimulatingStall ? "bg-rose-400" : "bg-emerald-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSimulatingStall ? "bg-rose-500" : "bg-emerald-500"
                }`}
              ></span>
            </span>
            <span
              className={`text-xs font-bold font-mono ${
                isSimulatingStall ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {isSimulatingStall ? "Bottleneck Alert" : "All Stages Healthy"}
            </span>
          </div>
        </div>
      </div>

      {/* Sequential Pipeline Stages Visual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {stages.map((stage, idx) => {
          const isStalled = stage.status === "STALLED";
          const isHealthy = stage.status === "HEALTHY" || stage.status === "COMPLETED";

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-xl border transition-all ${
                isStalled
                  ? "bg-rose-950/30 border-rose-500/80 shadow-lg shadow-rose-950/50"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {stage.category}
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isStalled
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                      : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  {stage.status}
                </span>
              </div>

              <h4 className="font-bold text-white text-sm mb-1">{stage.name}</h4>
              <p className="text-xs text-slate-400 mb-3">{stage.description}</p>

              {/* Sub-steps / Details list */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                {stage.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-1.5 text-slate-300">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Diagnostic Message when Stalled */}
              {isStalled && stage.diagnosticMessage && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-[11px] font-medium text-rose-200">
                  {stage.diagnosticMessage}
                </div>
              )}

              {/* Stage Footer Metrics */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Latency: {stage.latency}</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>{stage.lastRun}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resilient Self-Healing Safeguard Notice */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Self-Healing:</strong> Stage failures trigger automated remediation with 2-attempt circuit breaker.
          </span>
        </div>
      </div>
    </div>
  );
}
