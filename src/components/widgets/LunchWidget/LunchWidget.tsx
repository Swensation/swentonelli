"use client";

import useSWR from "swr";
import { DailyLunchMenu, LunchDayResponse } from "@/types/lunch";
import { SchoolStatusBadge } from "./SchoolStatusBadge";
import { LunchFoodIcon } from "./LunchFoodIcon";
import { format } from "date-fns";
import { Utensils, UtensilsCrossed, Calendar } from "lucide-react";
import confetti from "canvas-confetti";
import { useDashboard } from "@/context/DashboardContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LunchWidget() {
  const { selectedDate } = useDashboard();

  const { data, error, isLoading } = useSWR<LunchDayResponse>("/api/lunch", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const fireFunConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const allDays = data?.allDays || [];
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Match menu for master selected date
  const activeDay: DailyLunchMenu | null =
    allDays.find((d) => d.date === selectedDateStr) || null;

  return (
    <div className="glass-card p-6 w-full flex flex-col justify-between">
      {/* Pure Icon + Title Header (Zero Date String) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">School Lunch</h2>
            <p className="text-xs text-slate-400">Holliston Elementary Schools Menu</p>
          </div>
        </div>
        {data?.activeScheduleMonth && (
          <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{data.activeScheduleMonth}</span>
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading && !data && (
          <div className="space-y-4">
            <div className="h-32 bg-slate-800/50 animate-pulse rounded-2xl" />
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
            Failed to load school lunch menu.
          </div>
        )}

        {/* Day Card View for Master Selected Date */}
        {activeDay ? (
          <div
            onClick={() => {
              if (
                activeDay.items?.some((i) => i.toLowerCase().includes("pizza")) ||
                activeDay.isLastDay
              ) {
                fireFunConfetti();
              }
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-slate-900/90 border border-amber-500/25 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-amber-500/40"
          >
            <div className="space-y-2 flex-1">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                {activeDay.dayOfWeek} Daily Menu
              </div>

              {/* Main Entree with Food Icon */}
              {activeDay.items && activeDay.items.length > 0 && (
                <div className="flex items-center gap-3">
                  <LunchFoodIcon dishName={activeDay.items[0]} className="w-8 h-8 flex-shrink-0" />
                  <span className="text-xl md:text-2xl font-black text-white leading-tight">
                    {activeDay.items[0]}
                  </span>
                </div>
              )}

              {/* Sides / Accompanying items */}
              {activeDay.items && activeDay.items.length > 1 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm md:text-base font-medium text-slate-300 pl-11">
                  {activeDay.items.slice(1).map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1.5">
                      <span className="text-amber-400 text-xs">•</span>
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Badges & Special Note */}
            <div className="flex flex-col md:items-end gap-2 flex-shrink-0">
              <SchoolStatusBadge menu={activeDay} />
              {activeDay.specialNote && (
                <div className="text-xs font-semibold text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40">
                  📢 {activeDay.specialNote}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty / No School on Selected Date */
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-white text-base">No school lunch scheduled for this date</p>
                <p className="text-xs text-slate-400 mt-0.5">Weekend, holiday, or out-of-session</p>
              </div>
            </div>
            {data?.nextSchoolDay && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-3">
                <LunchFoodIcon dishName={data.nextSchoolDay.items[0] || ""} className="w-5 h-5 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Next School Day ({data.nextSchoolDay.dayOfWeek})
                  </span>
                  <span className="font-bold text-white">{data.nextSchoolDay.items[0]}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
