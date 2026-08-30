"use client";

import { useState } from "react";
import useSWR from "swr";
import { CalendarEvent } from "@/types/calendar";
import { DailyLunchMenu, LunchDayResponse } from "@/types/lunch";
import { extractChildAnnotations, filterActivityEvents } from "@/lib/annotations";
import { formatEasternTime, getEasternMinutes } from "@/lib/dateUtils";
import { ChildHeader } from "@/components/common/ChildHeader";
import { ChildLunchModal } from "@/components/widgets/LunchWidget/ChildLunchModal";
import { useDashboard } from "@/context/DashboardContext";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const KIDS = [
  { id: "aria", name: "Aria", avatarIcon: "/icons/children/aria.png", color: "#3b82f6", bgLight: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  { id: "brighton", name: "Brighton", avatarIcon: "/icons/children/brighton.png", color: "#f9a8d4", bgLight: "bg-pink-400/10", border: "border-pink-300/30", text: "text-pink-300" },
  { id: "benjamin", name: "Benjamin", avatarIcon: "/icons/children/benjamin.png", color: "#ef4444", bgLight: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  { id: "bennett", name: "Bennett", avatarIcon: "/icons/children/bennett.png", color: "#22c55e", bgLight: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
];

export function KidsColumnTimeline({ events }: KidsColumnTimelineProps) {
  const { selectedDate } = useDashboard();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch lunch schedule synchronized with master selected date
  const { data: lunchData } = useSWR<LunchDayResponse>(
    `/api/lunch?date=${dateStr}`,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  // Active popup modal state for lunch
  const [activeLunchModal, setActiveLunchModal] = useState<{
    childName: string;
    childColor: string;
    avatarIcon?: string;
    menu: DailyLunchMenu;
  } | null>(null);

  // Filter out custody and no-school banner events so they don't clutter the activity stream
  const activityEvents = filterActivityEvents(events);

  // Sort activity events chronologically
  const sortedEvents = [...activityEvents].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  // Calculate day time range for time-proportional staggering in Eastern Time
  const getEventMinutes = (isoString: string) => getEasternMinutes(isoString);

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
      {/* 4-Column Child Grid (All columns stretched to equal height of tallest column) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-stretch">
        {KIDS.map((kid) => {
          const kidEvents = eventsByKid[kid.id];
          const annotations = extractChildAnnotations(events, kid.id);

          // Resolve lunch menu for this specific child on the selected date
          let childLunchMenu: DailyLunchMenu | null = null;
          if (lunchData) {
            if (kid.id === "bennett") {
              childLunchMenu =
                lunchData.elementary?.[dateStr] ||
                lunchData.byChild?.bennett ||
                null;
              if (childLunchMenu) {
                childLunchMenu = {
                  ...childLunchMenu,
                  schoolName: "Miller Elementary School",
                };
              }
            } else if (kid.id === "brighton") {
              childLunchMenu =
                lunchData.secondary?.[dateStr] ||
                lunchData.byChild?.brighton ||
                null;
              if (childLunchMenu) {
                childLunchMenu = {
                  ...childLunchMenu,
                  schoolName: "Robert Adams Middle School (RAMS)",
                };
              }
            }
          }

          if (
            childLunchMenu?.isNoSchool ||
            !childLunchMenu?.items ||
            childLunchMenu.items.length === 0
          ) {
            childLunchMenu = null;
          }

          return (
            <div
              key={kid.id}
              className="rounded-2xl p-3.5 bg-slate-900/85 border-2 flex flex-col h-full min-h-[360px] shadow-lg transition-all"
              style={{ borderColor: `${kid.color}99` }}
            >
              {/* Universal Child Header Component with Lunch Badge */}
              <ChildHeader
                child={kid}
                annotations={annotations}
                lunchMenu={childLunchMenu}
                onLunchClick={() => {
                  if (childLunchMenu) {
                    setActiveLunchModal({
                      childName: kid.name,
                      childColor: kid.color,
                      avatarIcon: kid.avatarIcon,
                      menu: childLunchMenu,
                    });
                  }
                }}
              />

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
                      : `${formatEasternTime(ev.start)} - ${formatEasternTime(ev.end)}`;

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

      {/* Interactive Child Lunch Popup Modal */}
      {activeLunchModal && (
        <ChildLunchModal
          isOpen={true}
          onClose={() => setActiveLunchModal(null)}
          childName={activeLunchModal.childName}
          childColor={activeLunchModal.childColor}
          avatarIcon={activeLunchModal.avatarIcon}
          menu={activeLunchModal.menu}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
