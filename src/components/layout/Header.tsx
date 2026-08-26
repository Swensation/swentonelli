"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dog,
  LogIn,
  LogOut,
  QrCode,
  Settings,
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { QrCodeModal } from "./QrCodeModal";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const [imageError, setImageError] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { selectedDate, goToPrevDay, goToNextDay, setSelectedDate } = useDashboard();
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();

  const formattedSelectedDate = format(selectedDate, "EEEE, MMMM d, yyyy");
  const isoSelectedDate = format(selectedDate, "yyyy-MM-dd");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      // Parse as local date
      const [y, m, d] = e.target.value.split("-").map(Number);
      setSelectedDate(new Date(y, m - 1, d));
    }
  };

  return (
    <>
      <header className="w-full py-3.5 px-5 mb-6 glass-card flex items-center justify-between gap-4 flex-wrap">
        {/* Ribbon Left: Brand + Interactive Date Picker */}
        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          {/* Scout Photo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md flex-shrink-0 bg-amber-500/20 flex items-center justify-center">
              {!imageError ? (
                <img
                  src="/scout.png"
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
          <div className="h-8 w-px bg-slate-700/80 hidden sm:block" />

          {/* Master Date Stepper + Interactive Calendar Picker (Rock-solid fixed width so < > never jump) */}
          <div className="flex items-center bg-slate-900/90 rounded-2xl border border-slate-800 p-1 shadow-sm">
            <button
              onClick={goToPrevDay}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 flex-shrink-0"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Clickable Date Display Container with FIXED Width to prevent jumping */}
            <div className="relative w-[230px] sm:w-[260px] md:w-[300px] flex items-center justify-center">
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
        </div>

        {/* Ribbon Right: QR Code + Dad Admin Housekeeping (Gated on aswens@gmail.com) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="p-2.5 md:px-3.5 md:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 group shadow-sm active:scale-95 text-xs font-bold"
            title="Scan QR Code with Phone"
            aria-label="Scan QR Code with Phone"
          >
            <QrCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Phone QR</span>
          </button>

          {/* Admin Button ONLY shows when Dad (aswens@gmail.com) is logged in */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/admin"
                className="p-2.5 md:px-3.5 md:py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center gap-2 group shadow-sm active:scale-95 text-xs font-black"
                title="Dad Admin & Housekeeping"
                aria-label="Dad Admin & Housekeeping"
              >
                <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="hidden sm:inline">Admin</span>
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all text-xs"
                title="Log Out (Dad)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="p-2.5 md:px-3.5 md:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Dad Sign In (aswens@gmail.com)"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Dad Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Expandable Big QR Code Modal */}
      <QrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </>
  );
}
