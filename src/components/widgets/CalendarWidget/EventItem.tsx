"use client";

import { CalendarEvent } from "@/types/calendar";
import { format, parseISO } from "date-fns";
import {
  Clock,
  GraduationCap,
  HeartPulse,
  MapPin,
  Sparkles,
  Stethoscope,
  Trophy,
  User,
} from "lucide-react";

interface EventItemProps {
  event: CalendarEvent;
}

export function EventItem({ event }: EventItemProps) {
  const startDate = parseISO(event.start);
  const endDate = parseISO(event.end);

  const formattedTime = event.allDay
    ? "All Day"
    : `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;

  const enrichment = event.enrichment;

  // Render optional vector icon if no custom image icon
  const renderLucideIcon = (name?: string) => {
    switch (name) {
      case "Trophy":
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case "Stethoscope":
        return <Stethoscope className="w-5 h-5 text-rose-400" />;
      case "HeartPulse":
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case "GraduationCap":
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all ${
        event.isHappeningNow
          ? "bg-blue-950/40 border-blue-500/50 shadow-glow"
          : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/90"
      }`}
    >
      {/* Left colored border stripe matching calendar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
        style={{ backgroundColor: event.color || "#3b82f6" }}
      />

      <div className="pl-3 flex items-start gap-3.5">
        {/* Leading Custom Activity / Team Crest Icon */}
        {enrichment?.iconUrl ? (
          <div className="w-12 h-12 rounded-2xl bg-white/10 p-1.5 border border-slate-700/80 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={enrichment.iconUrl}
              alt={enrichment.badgeText || "Activity Logo"}
              className="w-full h-full object-contain"
            />
          </div>
        ) : enrichment?.iconName ? (
          <div className="w-11 h-11 rounded-2xl bg-slate-900/80 p-2.5 border border-slate-700 shadow-sm flex-shrink-0 flex items-center justify-center">
            {renderLucideIcon(enrichment.iconName)}
          </div>
        ) : null}

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base md:text-lg text-white leading-snug">
                  {event.summary}
                </h4>
                {event.isHappeningNow && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500 text-white animate-live-pulse">
                    <Sparkles className="w-3 h-3" /> NOW
                  </span>
                )}
              </div>

              {/* Tag Badges: Child Tag + Category Badge + Source Calendar */}
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                {enrichment?.child && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${enrichment.child.color || "#3b82f6"}22`,
                      borderColor: `${enrichment.child.color || "#3b82f6"}55`,
                      color: enrichment.child.color || "#60a5fa",
                    }}
                  >
                    <User className="w-3 h-3" />
                    {enrichment.child.name}
                  </span>
                )}

                {enrichment?.badgeText && enrichment.badgeText !== enrichment.child?.name && (
                  <span className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {enrichment.badgeText}
                  </span>
                )}

                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md text-slate-400 bg-slate-900/60"
                >
                  {event.sourceName}
                </span>
              </div>
            </div>

            {/* Time Chip */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-slate-300 font-mono">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {formattedTime}
              </div>
              {event.minutesUntilStart && event.minutesUntilStart <= 60 && !event.isHappeningNow && (
                <span className="text-[11px] font-bold text-amber-400">
                  Starts in {event.minutesUntilStart}m
                </span>
              )}
            </div>
          </div>

          {/* Location if present */}
          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
