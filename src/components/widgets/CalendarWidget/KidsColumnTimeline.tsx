"use client";

import { CalendarEvent } from "@/types/calendar";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  MapPin,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

interface KidsColumnTimelineProps {
  events: CalendarEvent[];
}

const KIDS = [
  { id: "aria", name: "Aria", color: "#3b82f6", bgLight: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  { id: "brighton", name: "Brighton", color: "#f97316", bgLight: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  { id: "benjamin", name: "Benjamin", color: "#8b5cf6", bgLight: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
  { id: "bennett", name: "Bennett", color: "#f59e0b", bgLight: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
];

export function KidsColumnTimeline({ events }: KidsColumnTimelineProps) {
  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  // Calculate day time range for time-proportional staggering
  const getEventMinutes = (isoString: string) => {
    try {
      const d = parseISO(isoString);
      return d.getHours() * 60 + d.getMinutes();
    } catch {
      return 480; // 8 AM default
    }
  };

  // Group events by child
  const eventsByKid: Record<string, CalendarEvent[]> = {
    aria: [],
    brighton: [],
    benjamin: [],
    bennett: [],
  };

  const sharedEvents: CalendarEvent[] = [];

  sortedEvents.forEach((ev) => {
    const childId = ev.enrichment?.child?.id?.toLowerCase();
    const childName = ev.enrichment?.child?.name?.toLowerCase() || "";
    const summary = ev.summary.toLowerCase();

    if (childId === "aria" || childName.includes("aria") || summary.includes("aria")) {
      eventsByKid.aria.push(ev);
    } else if (childId === "brighton" || childName.includes("brighton") || summary.includes("brighton")) {
      eventsByKid.brighton.push(ev);
    } else if (childId === "benjamin" || childName.includes("benjamin") || summary.includes("benjamin") || summary.includes("ben ")) {
      eventsByKid.benjamin.push(ev);
    } else if (childId === "bennett" || childName.includes("bennett") || summary.includes("bennett")) {
      eventsByKid.bennett.push(ev);
    } else {
      // General family event or shared
      sharedEvents.push(ev);
    }
  });

  // Determine earliest event times for day bounds
  const allMinutes = sortedEvents.map((e) => (e.allDay ? 480 : getEventMinutes(e.start)));
  const minMinute = allMinutes.length > 0 ? Math.min(420, Math.min(...allMinutes)) : 420; // At least 7 AM

  return (
    <div className="space-y-4">
      {/* 4-Column Child Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-start">
        {KIDS.map((kid) => {
          const kidEvents = eventsByKid[kid.id];

          return (
            <div
              key={kid.id}
              className={`rounded-2xl p-3.5 bg-slate-900/60 border ${kid.border} flex flex-col min-h-[360px] shadow-sm`}
            >
              {/* Column Header with Child Icon Avatar Support */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border flex-shrink-0"
                    style={{ borderColor: kid.color }}
                  >
                    <img
                      src={`/icons/children/${kid.id}.png`}
                      alt={kid.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: kid.color }}
                    />
                  </div>
                  <h3 className="font-black text-white text-base tracking-tight">{kid.name}</h3>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {kidEvents.length} {kidEvents.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              {/* Chronological Event Cards with Staggered Time Position */}
              {kidEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8 text-center">
                  <p className="text-xs font-semibold">No scheduled events</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {kidEvents.map((ev, index) => {
                    const eventMinute = ev.allDay ? minMinute : getEventMinutes(ev.start);
                    const prevEvent = index > 0 ? kidEvents[index - 1] : null;
                    const prevMinute = prevEvent ? (prevEvent.allDay ? minMinute : getEventMinutes(prevEvent.start)) : minMinute;
                    const relativeGap = Math.min(60, Math.max(0, eventMinute - prevMinute));
                    const extraTopMargin = index > 0 && relativeGap > 30 ? Math.min(32, Math.round(relativeGap / 3)) : 0;

                    const formattedTime = ev.allDay
                      ? "All Day"
                      : `${format(parseISO(ev.start), "h:mm a")} - ${format(parseISO(ev.end), "h:mm a")}`;

                    return (
                      <div
                        key={ev.id}
                        style={{ marginTop: extraTopMargin > 0 ? `${extraTopMargin}px` : undefined }}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2 relative group shadow-sm"
                      >
                        {/* Top: Icon + Time Badge */}
                        <div className="flex items-start gap-2.5">
                          {/* 36px Leading Icon Container */}
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center shadow-inner">
                            {ev.enrichment?.iconUrl ? (
                              <img
                                src={ev.enrichment.iconUrl}
                                alt={ev.enrichment.badgeText || "Icon"}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <CalendarIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Time Pill */}
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
                              <Clock className="w-3 h-3 text-amber-400/70 flex-shrink-0" />
                              <span className="truncate">{formattedTime}</span>
                            </div>

                            {/* Category Badge if present */}
                            {ev.enrichment?.badgeText && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 inline-block mt-0.5">
                                {ev.enrichment.badgeText}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Event Title */}
                        <h4 className="font-bold text-white text-xs leading-snug break-words">
                          {ev.summary}
                        </h4>

                        {/* Location if present */}
                        {ev.location && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Shared / Family Events Row if any */}
      {sharedEvents.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Family & Shared Events ({sharedEvents.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sharedEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5 text-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center">
                  {ev.enrichment?.iconUrl ? (
                    <img
                      src={ev.enrichment.iconUrl}
                      alt={ev.enrichment.badgeText || "Icon"}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{ev.summary}</div>
                  <div className="text-[11px] text-amber-400 font-mono">
                    {ev.allDay ? "All Day" : format(parseISO(ev.start), "h:mm a")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
