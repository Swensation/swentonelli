"use client";

import useSWR from "swr";
import { DailyLunchMenu, LunchDayResponse } from "@/types/lunch";
import { SchoolStatusBadge } from "./SchoolStatusBadge";
import { format } from "date-fns";
import { Utensils, UtensilsCrossed } from "lucide-react";
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
    <div className="glass-card p-6 flex flex-col h-full justify-between">
      {/* Pure Icon + Title Header (Zero Date String) */}
      <div>
        <div className="flex items-center pb-3 border-b border-slate-700/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">School Lunch</h2>
          </div>
        </div>
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
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-800/80 to-slate-900/90 border border-amber-500/25 transition-all shadow-sm"
          >
            {/* Meal Header (Zero Redundant Date) */}
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2">
              {activeDay.dayOfWeek} Daily Menu
            </div>

            {/* Line-by-Line Menu Items */}
            <div className="space-y-2 mt-3">
              {activeDay.items && activeDay.items.length > 0 ? (
                activeDay.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`${
                      idx === 0
                        ? "text-xl md:text-2xl font-black text-white leading-tight"
                        : "text-base md:text-lg font-medium text-slate-300 pl-3 flex items-center gap-2"
                    }`}
                  >
                    {idx > 0 && <span className="text-amber-400 text-sm">•</span>}
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <div className="text-lg font-bold text-slate-300">No items listed</div>
              )}
            </div>

            {/* Badges */}
            <div className="mt-4">
              <SchoolStatusBadge menu={activeDay} />
            </div>

            {/* Special Note */}
            {activeDay.specialNote && (
              <div className="mt-3 text-xs font-semibold text-amber-300 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40">
                📢 {activeDay.specialNote}
              </div>
            )}
          </div>
        ) : (
          /* Empty / No School on Selected Date */
          <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400">
            <UtensilsCrossed className="w-10 h-10 text-amber-400/70 mb-2" />
            <p className="font-semibold text-slate-300">No school lunch scheduled for this date</p>
            <p className="text-xs text-slate-500 mt-1">Weekend, holiday, or out-of-session</p>
          </div>
        )}
      </div>
    </div>
  );
}
