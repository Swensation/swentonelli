"use client";

import useSWR from "swr";
import {
  AlertTriangle,
  Droplets,
  Home,
  Mic,
  Thermometer,
  Zap,
} from "lucide-react";
import {
  HouseSystemsResponse,
  SmartDevice,
  SmartDeviceCategory,
} from "@/types/houseSystems";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SystemColumnConfig {
  id: SmartDeviceCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COLUMNS: SystemColumnConfig[] = [
  {
    id: "climate",
    title: "Climate & Comfort",
    icon: Thermometer,
  },
  {
    id: "irrigation",
    title: "Sprinklers",
    icon: Droplets,
  },
  {
    id: "power",
    title: "Smart Outlets",
    icon: Zap,
  },
  {
    id: "assistant",
    title: "Alexa",
    icon: Mic,
  },
];

export function HouseSystemsWidget() {
  const { data } = useSWR<HouseSystemsResponse>(
    "/api/house-systems",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  const devicesByCategory = data?.devicesByCategory || {
    climate: [],
    irrigation: [],
    power: [],
    assistant: [],
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      {/* Clean Icon + Title Header matching Our Calendar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Home className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Our Home</h2>
        </div>
      </div>

      {/* Content Area matching CalendarWidget */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3.5 items-stretch">
            {COLUMNS.map((col) => {
              const Icon = col.icon;
              const isClimate = col.id === "climate";
              const devices = isClimate ? (devicesByCategory.climate || []) : [];

              return (
                <div
                  key={col.id}
                  className="rounded-2xl p-3.5 bg-slate-900/85 border border-slate-800 flex flex-col h-full min-h-[360px] shadow-lg transition-all"
                >
                  {/* Column Header */}
                  <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-800/80">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-slate-300 flex items-center justify-center border border-slate-700/50 flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-white text-base md:text-lg tracking-tight truncate leading-tight">
                      {col.title}
                    </h3>
                  </div>

                  {/* Column Content */}
                  {isClimate ? (
                    <ClimateColumnContent devices={devices} />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12 text-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/30 p-4">
                      <p className="text-xs font-extrabold tracking-wider uppercase text-amber-400/80">
                        Dad To Do
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Clean, non-redundant Climate Section:
 * 1. Overall House Climate Hero summary
 * 2. Grouped clean floor cards (First Floor & Second Floor)
 */
function ClimateColumnContent({ devices }: { devices: SmartDevice[] }) {
  // Extract temperatures
  const temps = devices
    .map((d) => d.telemetry?.temperature)
    .filter((t): t is number => typeof t === "number" && !isNaN(t));

  const avgTemp = temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : 70;

  // Group devices by floor
  const firstFloorDevices = devices.filter(
    (d) =>
      (d.roomOrZone && d.roomOrZone.toLowerCase().includes("first")) ||
      d.name.toLowerCase().includes("first")
  );
  const secondFloorDevices = devices.filter(
    (d) =>
      (d.roomOrZone && d.roomOrZone.toLowerCase().includes("second")) ||
      d.name.toLowerCase().includes("second")
  );
  const otherDevices = devices.filter(
    (d) =>
      !firstFloorDevices.some((fd) => fd.id === d.id) &&
      !secondFloorDevices.some((sd) => sd.id === d.id)
  );

  const firstHp = firstFloorDevices.find((d) => d.provider === "smartthings" || d.name.toLowerCase().includes("pump") || d.name.toLowerCase().includes("samsung"));
  const firstBase = firstFloorDevices.find((d) => d.provider === "ecobee" || d.name.toLowerCase().includes("baseboard"));

  const secondHp = secondFloorDevices.find((d) => d.provider === "smartthings" || d.name.toLowerCase().includes("pump") || d.name.toLowerCase().includes("samsung"));
  const secondBase = secondFloorDevices.find((d) => d.provider === "ecobee" || d.name.toLowerCase().includes("baseboard"));

  const firstTemp = firstHp?.telemetry?.temperature ?? firstBase?.telemetry?.temperature ?? 69;
  const firstTarget = firstHp?.telemetry?.targetTemperature ?? 70;

  const secondTemp = secondHp?.telemetry?.temperature ?? secondBase?.telemetry?.temperature ?? 71;
  const secondTarget = secondHp?.telemetry?.targetTemperature ?? 72;

  const firstHpOn = firstHp?.telemetry?.powerState === "on" || firstHp?.status === "active";
  const firstBaseOn = firstBase?.telemetry?.hvacMode === "heat" || firstBase?.status === "active";
  const firstBaseTarget = firstBase?.telemetry?.targetTemperature;

  const secondHpOn = secondHp?.telemetry?.powerState === "on" || secondHp?.status === "active";
  const secondBaseOn = secondBase?.telemetry?.hvacMode === "heat" || secondBase?.status === "active";
  const secondBaseTarget = secondBase?.telemetry?.targetTemperature;

  return (
    <div className="space-y-3 flex flex-col h-full">
      {/* 1. First Floor Group */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">First Floor</h4>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{firstTemp}°F</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${firstHpOn ? "bg-cyan-400" : "bg-slate-600"}`} /> Heat Pump / AC
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              firstHpOn 
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
            }`}>
              {firstHpOn ? `ON • Set ${firstTarget}°F` : "Standby (Off)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${firstBaseOn ? "bg-amber-400" : "bg-slate-600"}`} /> Baseboard Heat
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              firstBaseOn 
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
            }`}>
              {firstBaseOn ? `Heating • Set ${firstBaseTarget ?? 68}°F` : "Standby (Off)"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Second Floor Group */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">Second Floor</h4>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{secondTemp}°F</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${secondHpOn ? "bg-cyan-400" : "bg-slate-600"}`} /> Heat Pump / AC
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              secondHpOn 
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
            }`}>
              {secondHpOn ? `ON • Set ${secondTarget}°F` : "Standby (Off)"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${secondBaseOn ? "bg-amber-400" : "bg-slate-600"}`} /> Baseboard Heat
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              secondBaseOn 
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
            }`}>
              {secondBaseOn ? `Heating • Set ${secondBaseTarget ?? 68}°F` : "Standby (Off)"}
            </span>
          </div>
        </div>
      </div>


      {/* Fallback for any unconfigured/custom devices */}
      {otherDevices.map((device) => (
        <SystemDeviceCard key={device.id} device={device} />
      ))}
    </div>
  );
}

function SystemDeviceCard({ device }: { device: SmartDevice }) {
  const isUnconfigured = device.status === "unconfigured" || !!device.dadTodo;
  const isWarning = device.status === "warning";
  const isOffline = device.status === "offline";

  return (
    <div
      className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
        isWarning
          ? "bg-rose-950/20 border-rose-500/40"
          : isUnconfigured
          ? "bg-slate-950/80 border-slate-800 hover:border-slate-700"
          : "bg-slate-950/80 border-slate-800"
      }`}
    >
      {/* Top row: Device Name + Status Pill */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-white text-xs md:text-sm tracking-tight truncate">
            {device.name}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {device.providerBrandName}
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex-shrink-0">
          {isUnconfigured ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DAD TODO
            </span>
          ) : isWarning ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> Alert
            </span>
          ) : isOffline ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
              Offline
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
            </span>
          )}
        </div>
      </div>

      {/* DAD TODO Instruction or Live Telemetry */}
      {device.dadTodo ? (
        <div className="p-2 rounded-lg bg-amber-950/25 border border-amber-500/20 text-[11px] text-amber-200/90 font-medium leading-relaxed">
          <strong className="text-amber-400 font-bold block mb-0.5">DAD TODO:</strong>
          {device.dadTodo}
        </div>
      ) : device.statusDetail ? (
        <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          {device.statusDetail}
        </p>
      ) : null}

      {/* Live metrics (if connected) */}
      {device.telemetry && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          {device.telemetry.temperature !== undefined && (
            <span>Temp: <strong className="text-white">{device.telemetry.temperature}°F</strong></span>
          )}
          {device.telemetry.powerState !== undefined && (
            <span>Power: <strong className="text-white uppercase">{device.telemetry.powerState}</strong></span>
          )}
        </div>
      )}
    </div>
  );
}
