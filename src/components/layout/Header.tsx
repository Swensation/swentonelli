"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Dog, QrCode, Settings } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { QrCodeModal } from "./QrCodeModal";

export function Header() {
  const [imageError, setImageError] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { selectedDate, goToPrevDay, goToNextDay } = useDashboard();

  const formattedSelectedDate = format(selectedDate, "EEEE, MMMM d, yyyy");

  return (
    <>
      <header className="w-full pt-3 pb-2.5 px-5 mb-6 glass-card flex flex-col gap-2.5">
        {/* Top Main Ribbon */}
        <div className="flex items-center justify-between gap-4">
          {/* Ribbon Left: Brand + Date Stepper */}
          <div className="flex items-center gap-4 md:gap-6 flex-wrap">
            {/* Scout Photo & Title */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md flex-shrink-0 bg-amber-500/20 flex items-center justify-center">
                {!imageError ? (
                  <img
                    src="/scout.jpeg"
                    alt="Scout the Beagle"
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Dog className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                Scouty Planner
              </h1>
            </div>

            {/* Divider */}
            <div className="h-7 w-px bg-slate-700/80 hidden sm:block" />

            {/* Master Date Carousel Stepper */}
            <div className="flex items-center bg-slate-900/90 rounded-xl border border-slate-800 p-1 shadow-sm">
              <button
                onClick={goToPrevDay}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-sm md:text-base font-black text-amber-400 px-4 min-w-[210px] text-center font-mono tracking-tight select-none">
                {formattedSelectedDate}
              </span>

              <button
                onClick={goToNextDay}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ribbon Right: Small QR Code Trigger Button */}
          <div>
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 md:px-3 md:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 group shadow-sm active:scale-95"
              title="Scan QR Code with Phone"
              aria-label="Scan QR Code with Phone"
            >
              <QrCode className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold hidden sm:inline text-slate-300 group-hover:text-white">
                Scan for Phone
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Ribbon Bar: Subtle Link to Admin & Housekeeping */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-slate-500">Scouty Family Kiosk</span>
          <Link
            href="/admin"
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 font-semibold transition-colors group"
          >
            <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform text-amber-400" />
            <span>Dad Admin & Housekeeping →</span>
          </Link>
        </div>
      </header>

      {/* Expandable Big QR Code Modal */}
      <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </>
  );
}
