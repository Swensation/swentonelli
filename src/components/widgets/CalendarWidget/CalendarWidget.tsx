"use client";

import { useState } from "react";
import useSWR from "swr";
import { CalendarAgenda } from "@/types/calendar";
import { DailyLunchMenu, LunchDayResponse } from "@/types/lunch";
import { EventItem } from "./EventItem";
import { KidsColumnTimeline } from "./KidsColumnTimeline";
import { ChildLunchModal } from "@/components/widgets/LunchWidget/ChildLunchModal";
import { getDailyFamilySummary, filterActivityEvents } from "@/lib/annotations";
import { AlertCircle, Calendar as CalendarIcon, Columns3, GraduationCap, Home, LayoutList, Sparkles, Utensils } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CalendarWidget() {
  const [viewMode, setViewMode] = useState<"kids" | "aggregate">("kids");
  const { selectedDate, isToday, isTomorrow } = useDashboard();

  // Auto-refresh every 30 seconds for live Google Calendar sync
  const { data, error, isLoading } = useSWR<CalendarAgenda>("/api/calendar", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch school lunch menus synchronized with master selected date
  const { data: lunchData } = useSWR<LunchDayResponse>(
    `/api/lunch?date=${selectedDateStr}`,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  const [activeLunchModal, setActiveLunchModal] = useState<{
    childName: string;
    childColor: string;
    avatarIcon?: string;
    menu: DailyLunchMenu;
  } | null>(null);

  // Determine active events matching master selected date (supports past and future)
  const activeEvents = data?.byDate?.[selectedDateStr] || [];
  const activityEvents = filterActivityEvents(activeEvents);
  const daySummary = getDailyFamilySummary(activeEvents);

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      {/* Pure Icon + Title Header + View Toggle (Zero Date Display) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Family Calendar</h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs font-bold shadow-sm">
          <button
            onClick={() => setViewMode("kids")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "kids"
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="4-Column All Kids View"
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Kids Columns</span>
          </button>

          <button
            onClick={() => setViewMode("aggregate")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "aggregate"
                ? "bg-blue-600 text-white shadow-sm font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Daily Summary View"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Daily Summary</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
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
            {activityEvents.length === 0 && viewMode === "aggregate" ? (
              <div>
                {/* Daily Summary Banner: Ben / Aria & Brighton / Bennett Household & School Status */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex-wrap mb-4">
                  {/* Ben & Aria */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-300">Ben &amp; Aria:</span>
                    {daySummary.ariaBen.custody && (
                      <span
                        className="w-[76px] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center justify-center gap-1 text-white shadow-sm transition-all"
                        style={daySummary.ariaBen.custody.badgeStyle}
                        title={`Custody: ${daySummary.ariaBen.custody.label} (${daySummary.ariaBen.custody.parentName} - ${daySummary.ariaBen.custody.town})`}
                      >
                        <Home className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{daySummary.ariaBen.custody.label}</span>
                      </span>
                    )}
                    {daySummary.ariaBen.school && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${daySummary.ariaBen.school.badgeClass}`}
                      >
                        <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>{daySummary.ariaBen.school.label}</span>
                      </span>
                    )}
                  </div>

                  <div className="h-4 w-px bg-slate-800 hidden sm:block" />

                  {/* Brighton & Bennett */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-300">Brighton &amp; Bennett:</span>
                    {daySummary.brightonBennett.custody && (
                      <span
                        className="w-[76px] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center justify-center gap-1 text-white shadow-sm transition-all"
                        style={daySummary.brightonBennett.custody.badgeStyle}
                        title={`Custody: ${daySummary.brightonBennett.custody.label} (${daySummary.brightonBennett.custody.parentName} - ${daySummary.brightonBennett.custody.town})`}
                      >
                        <Home className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{daySummary.brightonBennett.custody.label}</span>
                      </span>
                    )}
                    {daySummary.brightonBennett.school && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${daySummary.brightonBennett.school.badgeClass}`}
                      >
                        <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>{daySummary.brightonBennett.school.label}</span>
                      </span>
                    )}

                    {/* Bennett & Brighton Lunch Badges in Daily Summary */}
                    {lunchData?.elementary?.[selectedDateStr] && !lunchData.elementary[selectedDateStr].isNoSchool && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveLunchModal({
                            childName: "Bennett",
                            childColor: "#22c55e",
                            avatarIcon: "/icons/children/bennett.png",
                            menu: {
                              ...lunchData.elementary![selectedDateStr],
                              schoolName: "Miller Elementary School",
                            },
                          })
                        }
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="Bennett's Miller Elementary Lunch - Click to view"
                      >
                        <Utensils className="w-2.5 h-2.5 flex-shrink-0 text-amber-400" />
                        <span>Bennett Lunch</span>
                      </button>
                    )}
                    {lunchData?.secondary?.[selectedDateStr] && !lunchData.secondary[selectedDateStr].isNoSchool && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveLunchModal({
                            childName: "Brighton",
                            childColor: "#f9a8d4",
                            avatarIcon: "/icons/children/brighton.png",
                            menu: {
                              ...lunchData.secondary![selectedDateStr],
                              schoolName: "Robert Adams Middle School (RAMS)",
                            },
                          })
                        }
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="Brighton's Adams Middle School Lunch - Click to view"
                      >
                        <Utensils className="w-2.5 h-2.5 flex-shrink-0 text-amber-400" />
                        <span>Brighton Lunch</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
                  <Sparkles className="w-10 h-10 text-amber-400 mb-2 opacity-80" />
                  <p className="font-semibold text-slate-300">
                    Nothing scheduled for {isToday ? "today" : isTomorrow ? "tomorrow" : "this day"}!
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Enjoy some free family time 🌟</p>
                </div>
              </div>
            ) : viewMode === "kids" ? (
              <KidsColumnTimeline events={activeEvents} />
            ) : (
              <div className="space-y-3">
                {/* Daily Summary Banner: Ben / Aria & Brighton / Bennett Household & School Status */}
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex-wrap mb-4">
                  {/* Ben & Aria */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-300">Ben &amp; Aria:</span>
                    {daySummary.ariaBen.custody && (
                      <span
                        className="w-[76px] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center justify-center gap-1 text-white shadow-sm transition-all"
                        style={daySummary.ariaBen.custody.badgeStyle}
                        title={
                          daySummary.ariaBen.custody.status === "error"
                            ? `Custody Conflict: ${daySummary.ariaBen.custody.parentName} (${daySummary.ariaBen.custody.town})`
                            : `Custody: ${daySummary.ariaBen.custody.label} (${daySummary.ariaBen.custody.parentName} - ${daySummary.ariaBen.custody.town})`
                        }
                      >
                        {daySummary.ariaBen.custody.status === "error" ? (
                          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 text-amber-200" />
                        ) : (
                          <Home className="w-2.5 h-2.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{daySummary.ariaBen.custody.label}</span>
                      </span>
                    )}
                    {daySummary.ariaBen.school && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${daySummary.ariaBen.school.badgeClass}`}
                      >
                        <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>{daySummary.ariaBen.school.label}</span>
                      </span>
                    )}
                  </div>

                  <div className="h-4 w-px bg-slate-800 hidden sm:block" />

                  {/* Brighton & Bennett */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-300">Brighton &amp; Bennett:</span>
                    {daySummary.brightonBennett.custody && (
                      <span
                        className="w-[76px] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center justify-center gap-1 text-white shadow-sm transition-all"
                        style={daySummary.brightonBennett.custody.badgeStyle}
                        title={
                          daySummary.brightonBennett.custody.status === "error"
                            ? `Custody Conflict: ${daySummary.brightonBennett.custody.parentName} (${daySummary.brightonBennett.custody.town})`
                            : `Custody: ${daySummary.brightonBennett.custody.label} (${daySummary.brightonBennett.custody.parentName} - ${daySummary.brightonBennett.custody.town})`
                        }
                      >
                        {daySummary.brightonBennett.custody.status === "error" ? (
                          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0 text-amber-200" />
                        ) : (
                          <Home className="w-2.5 h-2.5 flex-shrink-0" />
                        )}
                        <span className="truncate">{daySummary.brightonBennett.custody.label}</span>
                      </span>
                    )}
                    {daySummary.brightonBennett.school && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border flex items-center gap-1 shadow-sm ${daySummary.brightonBennett.school.badgeClass}`}
                      >
                        <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>{daySummary.brightonBennett.school.label}</span>
                      </span>
                    )}

                    {/* Bennett & Brighton Lunch Badges in Daily Summary */}
                    {lunchData?.elementary?.[selectedDateStr] && !lunchData.elementary[selectedDateStr].isNoSchool && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveLunchModal({
                            childName: "Bennett",
                            childColor: "#22c55e",
                            avatarIcon: "/icons/children/bennett.png",
                            menu: {
                              ...lunchData.elementary![selectedDateStr],
                              schoolName: "Miller Elementary School",
                            },
                          })
                        }
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="Bennett's Miller Elementary Lunch - Click to view"
                      >
                        <Utensils className="w-2.5 h-2.5 flex-shrink-0 text-amber-400" />
                        <span>Bennett Lunch</span>
                      </button>
                    )}
                    {lunchData?.secondary?.[selectedDateStr] && !lunchData.secondary[selectedDateStr].isNoSchool && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveLunchModal({
                            childName: "Brighton",
                            childColor: "#f9a8d4",
                            avatarIcon: "/icons/children/brighton.png",
                            menu: {
                              ...lunchData.secondary![selectedDateStr],
                              schoolName: "Robert Adams Middle School (RAMS)",
                            },
                          })
                        }
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                        title="Brighton's Adams Middle School Lunch - Click to view"
                      >
                        <Utensils className="w-2.5 h-2.5 flex-shrink-0 text-amber-400" />
                        <span>Brighton Lunch</span>
                      </button>
                    )}
                  </div>
                </div>

                {activityEvents.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
