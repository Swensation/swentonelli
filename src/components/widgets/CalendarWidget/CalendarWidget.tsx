"use client";

import useSWR from "swr";
import { CalendarAgenda } from "@/types/calendar";
import { EventItem } from "./EventItem";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CalendarWidget() {
  const { selectedDate, isToday, isTomorrow } = useDashboard();

  // Auto-refresh every 30 seconds for live Google Calendar sync
  const { data, error, isLoading } = useSWR<CalendarAgenda>("/api/calendar", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const formattedDayTitle = format(selectedDate, "EEEE, MMMM d, yyyy");

  // Determine active events matching master selected date
  let activeEvents = data?.today || [];
  if (isTomorrow) {
    activeEvents = data?.tomorrow || [];
  } else if (!isToday) {
    const upcomingMatch = data?.upcoming?.find((u) => u.date === selectedDateStr);
    activeEvents = upcomingMatch ? upcomingMatch.events : [];
  }

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      {/* Pure Icon + Title Header */}
      <div className="flex items-center pb-4 border-b border-slate-700/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Family Calendar</h2>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {isLoading && !data && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
            Failed to load calendar events. Check your network or calendar configuration.
          </div>
        )}

        {data && (
          <>
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-400 mb-2">
              {formattedDayTitle}
            </div>

            {activeEvents.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
                <Sparkles className="w-10 h-10 text-amber-400 mb-2 opacity-80" />
                <p className="font-semibold text-slate-300">Nothing scheduled for {isToday ? "today" : isTomorrow ? "tomorrow" : "this day"}!</p>
                <p className="text-xs text-slate-500 mt-1">Enjoy some free family time 🌟</p>
              </div>
            ) : (
              activeEvents.map((event) => <EventItem key={event.id} event={event} />)
            )}
          </>
        )}
      </div>
    </div>
  );
}
