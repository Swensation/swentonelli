"use client";

import { ChildDayAnnotations } from "@/lib/annotations";
import { GraduationCap, Home } from "lucide-react";

export interface ChildHeaderProps {
  child: {
    id: string;
    name: string;
    avatarIcon?: string;
    color?: string;
  };
  annotations?: ChildDayAnnotations;
  className?: string;
  compact?: boolean;
}

/**
 * Universal Child Header Component
 *
 * Implements the standard Child Header specification across all widgets:
 * 1. 50% larger avatar (w-14 h-14 / 56px rounded-full)
 * 2. Consistent neutral slate avatar border (border border-slate-700/80)
 * 3. Fixed-width, non-jumping custody badge (w-[76px] justify-center)
 * 4. Zero extraneous subtitles
 */
export function ChildHeader({
  child,
  annotations,
  className = "",
  compact = false,
}: ChildHeaderProps) {
  const avatarSrc = child.avatarIcon || `/icons/children/${child.id}.png`;

  return (
    <div
      className={`flex items-center justify-between gap-2.5 pb-3 mb-3 border-b border-slate-800/80 ${className}`}
    >
      {/* Left: 50% Larger Avatar + Child Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 border border-slate-700/80 flex-shrink-0 shadow-md">
          <img
            src={avatarSrc}
            alt={child.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-black text-white text-base md:text-lg tracking-tight truncate leading-tight">
            {child.name}
          </h3>
        </div>
      </div>

      {/* Right: Top-Right Justified Badges with Fixed Width to Prevent Typography Layout Shift */}
      {annotations && (
        <div className="flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ml-auto">
          {/* Custody Badge with Fixed Width (w-[76px]) so Mom's vs Dad's Never Jumps */}
          {annotations.custody && (
            <span
              className="w-[76px] text-[10px] font-extrabold px-1.5 py-1 rounded-full border flex items-center justify-center gap-1 shadow-sm text-white transition-all flex-shrink-0"
              style={annotations.custody.badgeStyle}
              title={`Custody: ${annotations.custody.label} (${annotations.custody.parentName} - ${annotations.custody.town})`}
            >
              <Home className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{annotations.custody.label}</span>
            </span>
          )}

          {/* School Status Badge */}
          {annotations.school && (
            <span
              className={`text-[10px] font-extrabold px-2 py-1 rounded-full border flex items-center gap-1 shadow-sm ${annotations.school.badgeClass}`}
            >
              <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{annotations.school.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
