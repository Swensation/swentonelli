"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Dog,
  HelpCircle,
  Home,
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
  const { activeTab, setActiveTab } = useDashboard();
  const { isAdmin, loginWithGoogle, logout } = useAuth();

  return (
    <>
      <header className="w-full py-3 px-5 mb-6 glass-card flex items-center justify-between gap-4 flex-wrap">
        {/* Ribbon Left: Scout Avatar & Title */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md flex-shrink-0 bg-amber-500/20 flex items-center justify-center">
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

        {/* Navigation Switcher: Scalable Segmented Tabs */}
        <nav
          className="flex items-center bg-slate-900/90 rounded-2xl border border-slate-800 p-1 shadow-sm gap-1"
          aria-label="Dashboard Views"
        >
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
              activeTab === "calendar"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
            title="Our Calendar (Family Calendar)"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Our Calendar</span>
          </button>
          <button
            onClick={() => setActiveTab("house")}
            className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black transition-all flex items-center gap-2 active:scale-95 ${
              activeTab === "house"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
            title="Our Home (10 Bullard Lane)"
          >
            <Home className="w-4 h-4" />
            <span>Our Home</span>
          </button>
        </nav>

        {/* Ribbon Right: Help Guide + QR Code + Dad Admin Utility Cluster */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Swensation/swentonelli#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center group shadow-sm active:scale-95"
            title="How to Contribute (Help & Guides)"
            aria-label="How to Contribute (Help & Guides)"
          >
            <HelpCircle className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </a>

          <button
            onClick={() => setIsQrModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center group shadow-sm active:scale-95"
            title="Scan QR Code to open on phone/iPad"
            aria-label="Scan QR Code to open on phone/iPad"
          >
            <QrCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>

          {/* Admin Button ONLY shows when Dad (aswens@gmail.com) is logged in - icon-only */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/admin"
                className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-center group shadow-sm active:scale-95"
                title="Dad Admin & Housekeeping"
                aria-label="Dad Admin & Housekeeping"
              >
                <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              </Link>

              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all flex items-center justify-center"
                title="Log Out (Dad)"
                aria-label="Log Out (Dad)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="p-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
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
