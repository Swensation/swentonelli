"use client";

import { CalendarEvent } from "@/types/calendar";
import { extractChildAnnotations, filterActivityEvents } from "@/lib/annotations";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
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
  { id: "brighton", name: "Brighton", color: "#f472b6", bgLight: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-400" },
  { id: "benjamin", name: "Benjamin", color: "#ef4444", bgLight: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  { id: "bennett", name: "Bennett", color: "#22c55e", bgLight: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
];

export function KidsColumnTimeline({ events }: KidsColumnTimelineProps) {
  // Filter out custody and no-school banner events so they don't clutter the activity stream
  const activityEvents = filterActivityEvents(events);

  // Sort activity events chronologically
  const sortedEvents = [...activityEvents].sort((a, b) => {
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

  // Group activity events by child
  const eventsByKid: Record<string, CalendarEvent[]> = {
    aria: [],
    brighton: [],
    benjamin: [],
    bennett: [],
  };

  const unknownEvents: CalendarEvent[] = [];

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
      // Unassigned / unknown event - needs rule assignment
      unknownEvents.push(ev);
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
          const annotations = extractChildAnnotations(events, kid.id);

          return (
            <div
              key={kid.id}
              className={`rounded-2xl p-3.5 bg-slate-900/60 border ${kid.border} flex flex-col min-h-[360px] shadow-sm`}
            >
              {/* Column Header: Larger Avatar + Child Name on Left, Badges Strictly Top-Right Justified on One Line */}
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800">
                {/* Left: Avatar + Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border-2 flex-shrink-0 shadow-md"
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
                  </div>
                  <h3 className="font-black text-white text-base md:text-lg tracking-tight truncate">{kid.name}</h3>
                </div>

                {/* Right: Top-Right Justified Badges (Never wrap to new line) */}
                <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ml-auto">
                  {/* Custody Badge */}
                  {annotations.custody && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${annotations.custody.badgeClass}`}
                      title={`Custody: ${annotations.custody.label} (${annotations.custody.parentName})`}
                    >
                      <Home className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{annotations.custody.label}</span>
                    </span>
                  )}

                  {/* School Status Badge */}
                  {annotations.school && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${annotations.school.badgeClass}`}
                    >
                      <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{annotations.school.label}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Chronological Event Cards with Staggered Time Position */}
              {kidEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8 text-center">
                  <p className="text-xs font-semibold">No scheduled activities</p>
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

                    const googleCalUrl =
                      ev.url ||
                      `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(ev.summary)}`;

                    return (
                      <div
                        key={ev.id}
                        style={{ marginTop: extraTopMargin > 0 ? `${extraTopMargin}px` : undefined }}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2 relative group shadow-sm"
                      >
                        {/* Top: Icon + Time Badge + Subtle Link Icon */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
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

                          {/* Subtle Google Calendar Invite Link Icon in top right corner */}
                          <a
                            href={googleCalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-amber-400 p-1 rounded-lg hover:bg-slate-800 transition-colors opacity-50 hover:opacity-100 flex-shrink-0"
                            title="Open in Google Calendar"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
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

      {/* Unknown / Uncategorized Events Section (Red Border & HelpCircle ? Icon) */}
      {unknownEvents.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 shadow-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-500/20">
            <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <HelpCircle className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-black text-rose-400 text-xs uppercase tracking-wider">
              Unknown / Uncategorized Events ({unknownEvents.length})
            </h4>
            <span className="text-[10px] text-rose-400/80 ml-auto font-bold">
              Needs Rule or Child Assignment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unknownEvents.map((ev) => {
              const googleCalUrl =
                ev.url ||
                `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(ev.summary)}`;

              return (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 flex items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex-shrink-0 flex items-center justify-center text-rose-400 shadow-inner font-bold">
                      {ev.enrichment?.iconUrl ? (
                        <img
                          src={ev.enrichment.iconUrl}
                          alt="Icon"
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{ev.summary}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-amber-400 font-mono">
                          {ev.allDay ? "All Day" : format(parseISO(ev.start), "h:mm a")}
                        </span>
                        {ev.location && (
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-slate-500" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subtle Google Calendar Invite Link Icon */}
                  <a
                    href={googleCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-amber-400 p-1 rounded-lg hover:bg-slate-800 transition-colors opacity-50 hover:opacity-100 flex-shrink-0"
                    title="Open in Google Calendar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
