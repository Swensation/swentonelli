"use client";

import React, { useEffect } from "react";
import { DailyLunchMenu } from "@/types/lunch";
import { LunchFoodIcon } from "./LunchFoodIcon";
import { SchoolStatusBadge } from "./SchoolStatusBadge";
import { X, Utensils, Sparkles, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { format, parseISO } from "date-fns";

export interface ChildLunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  childColor?: string;
  avatarIcon?: string;
  menu: DailyLunchMenu | null;
  selectedDate?: Date;
}

export function ChildLunchModal({
  isOpen,
  onClose,
  childName,
  childColor = "#3b82f6",
  avatarIcon,
  menu,
  selectedDate,
}: ChildLunchModalProps) {
  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Trigger fun confetti if pizza is on the menu!
  useEffect(() => {
    if (isOpen && menu?.items?.some((i) => i.toLowerCase().includes("pizza"))) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore in non-browser env
      }
    }
  }, [isOpen, menu]);

  if (!isOpen) return null;

  const dateToFormat = menu?.date
    ? parseISO(menu.date)
    : selectedDate || new Date();
  const formattedDate = format(dateToFormat, "EEEE, MMMM d, yyyy");

  const avatarSrc =
    avatarIcon || ('/icons/children/' + childName.toLowerCase() + '.png');
  const mainItem = menu?.items?.[0] || 'No Menu Listed';
  const sideItems = menu?.items?.slice(1) || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lunch-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl transition-all"
        style={{
          boxShadow: `0 20px 50px -10px ${childColor}33`,
        }}
      >
        {/* Top Gradient Banner */}
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(to right, ${childColor}, #f59e0b)`,
          }}
        />
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border-2 border-slate-700 shadow-md flex-shrink-0">
              <img
                src={avatarSrc}
                alt={childName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="lunch-modal-title"
                  className="text-xl font-black text-white tracking-tight"
                >
                  {childName}&apos;s School Lunch
                </h3>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {menu?.schoolName || "Holliston Public Schools"}
              </p>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {menu ? (
            <>
              {/* Main Entree Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-800/90 to-slate-900 border border-amber-500/30 shadow-sm">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Today&apos;s Main Entrée</span>
                </div>
                <div className="flex items-center gap-3.5 mt-2">
                  <LunchFoodIcon dishName={mainItem} className="w-10 h-10 flex-shrink-0" />
                  <div className="text-2xl font-black text-white leading-tight">
                    {mainItem}
                  </div>
                </div>

                {/* Dietary & Status Badges */}
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <SchoolStatusBadge menu={menu} />
                </div>
              </div>

              {/* Sides / Accompaniments */}
              {sideItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sides &amp; Vegetables
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {sideItems.map((side, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-200 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-700/40"
                      >
                        <span className="text-amber-400 text-xs font-bold">•</span>
                        <span>{side}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Note */}
              {menu.specialNote && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{menu.specialNote}</span>
                </div>
              )}

              {/* Daily Inclusions & Nutrition Info */}
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">🥗 District Standard Inclusions</div>
                <p>
                  All meals include fresh fruit, assorted vegetables, and choice of milk daily.
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Daily Alternates: Pasta with choice of sauce, Chicken Patty sandwich, or fresh salad.
                </p>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 text-amber-400/80 mb-1" />
              <p className="text-base font-bold text-white">No School Lunch Scheduled</p>
              <p className="text-xs text-slate-500 max-w-xs">
                No menu published for this date (weekend, school holiday, or out-of-session).
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Source: Holliston Food Services</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
