"use client";

import { DailyLunchMenu } from "@/types/lunch";
import { AlertCircle, Award, Bus, Clock, Sun } from "lucide-react";

interface SchoolStatusBadgeProps {
  menu: DailyLunchMenu;
}

export function SchoolStatusBadge({ menu }: SchoolStatusBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1">
      {menu.isNoSchool && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3 h-3" /> No School
        </span>
      )}


      {menu.isEarlyRelease && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" /> Early Release
        </span>
      )}

      {menu.isFieldTrip && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <Bus className="w-3 h-3" /> Field Trip
        </span>
      )}

      {menu.isLastDay && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-bounce">
          <Sun className="w-3 h-3 text-yellow-400" /> Summer Break!
        </span>
      )}

      {menu.isChefChoice && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          <Award className="w-3 h-3" /> Chef&apos;s Choice
        </span>
      )}
    </div>
  );
}
