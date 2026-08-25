"use client";

import { CalendarEvent } from "@/types/calendar";
import { formatEasternTime } from "@/lib/dateUtils";
import { Clock, ExternalLink, MapPin } from "lucide-react";

interface EventItemProps {
  event: CalendarEvent;
}

/**
 * EventItem Component (Clean layout matching child column event cards)
 */
export function EventItem({ event }: EventItemProps) {
  const formattedTime = event.allDay
    ? "All Day"
    : `${formatEasternTime(event.start)} - ${formatEasternTime(event.end)}`;

  const enrichment = event.enrichment;
  const googleCalUrl = event.url || "https://calendar.google.com";

  return (
    <div
      className={`relative p-3.5 md:p-4 rounded-xl border transition-all ${
        event.isHappeningNow
          ? "bg-blue-950/40 border-blue-500/50 shadow-glow"
          : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/90"
      }`}
    >
      {/* Left colored border stripe matching child or calendar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
        style={{ backgroundColor: enrichment?.child?.color || event.color || "#3b82f6" }}
      />

      <div className="pl-2 flex items-start justify-between gap-3">
        {/* Left: 44px Crest/Avatar Container + Details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
            {enrichment?.iconUrl ? (
              <img
                src={enrichment.iconUrl}
                alt={enrichment.category || "Activity Crest"}
                className="w-full h-full object-contain"
              />
            ) : enrichment?.child ? (
              <img
                src={`/icons/children/${enrichment.child.id}.png`}
                alt={enrichment.child.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-sm">📅</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm md:text-base text-white leading-snug break-words">
                {event.summary}
              </h4>
              {enrichment?.child && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{
                    backgroundColor: `${enrichment.child.color}22`,
                    borderColor: `${enrichment.child.color}66`,
                    color: enrichment.child.color,
                  }}
                >
                  {enrichment.child.name}
                </span>
              )}
            </div>

            {/* Location if present */}
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 truncate">
                <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Time & Subtle Google Calendar Link */}
        <div className="flex items-center gap-2 flex-shrink-0 text-right">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
            <span>{formattedTime}</span>
          </div>

          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors opacity-60 hover:opacity-100 flex-shrink-0"
            title="Open in Google Calendar"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
