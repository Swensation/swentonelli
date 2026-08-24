"use client";

import { CalendarEvent } from "@/types/calendar";
import { format, parseISO } from "date-fns";
import {
  Briefcase,
  Cake,
  Calendar,
  Clock,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  MapPin,
  Palmtree,
  Sparkles,
  Stethoscope,
  Trophy,
  User,
  Users,
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

  const googleCalUrl =
    event.url ||
    `https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(event.summary)}`;

  // Render vector icon matching the category
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
      case "Users":
        return <Users className="w-5 h-5 text-emerald-400" />;
      case "Palmtree":
        return <Palmtree className="w-5 h-5 text-teal-400" />;
      case "Cake":
        return <Cake className="w-5 h-5 text-pink-400" />;
      case "Briefcase":
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      case "User":
        return <User className="w-5 h-5 text-sky-400" />;
      case "Calendar":
      default:
        return <Calendar className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div
      className={`relative p-3.5 md:p-4 rounded-xl border transition-all ${
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
        {/* Uniform Fixed-Size Avatar Container (w-12 h-12 / 48px) for EVERY event */}
        <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden p-1.5">
          {enrichment?.iconUrl ? (
            <img
              src={enrichment.iconUrl}
              alt={enrichment.badgeText || "Activity Crest"}
              className="w-full h-full object-contain"
            />
          ) : (
            renderLucideIcon(enrichment?.iconName)
          )}
        </div>

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

            {/* Time Chip & Subtle Google Calendar Link Icon */}
            <div className="text-right flex-shrink-0 flex items-center gap-2">
              <div>
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

              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-700/60 transition-colors opacity-50 hover:opacity-100"
                title="Open in Google Calendar"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
