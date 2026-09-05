"use client";

import React, { useRef, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export function DateStepper() {
  const { selectedDate, goToPrevDay, goToNextDay, setSelectedDate } = useDashboard();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formattedSelectedDate = useMemo(() => {
    return format(selectedDate, "EEEE, MMMM d, yyyy");
  }, [selectedDate]);

  const isoSelectedDate = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split("-").map(Number);
      setSelectedDate(new Date(y, m - 1, d));
    }
  };

  return (
    <div className="flex items-center bg-slate-900/90 rounded-2xl border border-slate-800 p-1 shadow-sm h-[44px]">
      <button
        onClick={goToPrevDay}
        className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 flex-shrink-0"
        title="Previous Day"
        aria-label="Previous Day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Clickable Date Display Container with FIXED Width to prevent jumping */}
      <div className="relative w-[230px] sm:w-[260px] md:w-[290px] flex items-center justify-center">
        <button
          onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-800/80 text-amber-400 hover:text-amber-300 transition-all font-sans group select-none"
          title="Click to jump to any date"
        >
          <CalendarIcon className="w-4 h-4 text-amber-400/80 group-hover:text-amber-300 transition-transform group-hover:scale-110 flex-shrink-0" />
          <span className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-center">
            {formattedSelectedDate}
          </span>
        </button>

        <input
          ref={dateInputRef}
          type="date"
          value={isoSelectedDate}
          onChange={handleDateChange}
          className="sr-only"
          tabIndex={-1}
          aria-label="Select Date"
        />
      </div>

      <button
        onClick={goToNextDay}
        className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 flex-shrink-0"
        title="Next Day"
        aria-label="Next Day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
