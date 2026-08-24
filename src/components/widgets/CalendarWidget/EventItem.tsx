"use client";

import { CalendarEvent } from "@/types/calendar";
import { format, parseISO } from "date-fns";
import { Clock, MapPin, Sparkles } from "lucide-react";

interface EventItemProps {
  event: CalendarEvent;
}

export function EventItem({ event }: EventItemProps) {
  const startDate = parseISO(event.start);
  const endDate = parseISO(event.end);

  const formattedTime = event.allDay
    ? "All Day"
    : `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all ${
        event.isHappeningNow
          ? "bg-blue-950/40 border-blue-500/50 shadow-glow"
          : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/90"
      }`}
    >
      {/* Left colored border stripe */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
        style={{ backgroundColor: event.color || "#3b82f6" }}
      />

      <div className="pl-3">
        <div className="flex items-start justify-between gap-2">
          {/* Title & Source */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base md:text-lg text-white leading-snug">
                {event.summary}
              </h4>
              {event.isHappeningNow && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500 text-white animate-live-pulse">
                  <Sparkles className="w-3 h-3" /> NOW
                </span>
              )}
            </div>
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md mt-1"
              style={{
                backgroundColor: `${event.color || "#3b82f6"}22`,
                color: event.color || "#60a5fa",
              }}
            >
              {event.sourceName}
            </span>
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
  );
}

