"use client";

import { useState } from "react";
import { Mic, Sparkles } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

export function FloatingFeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-2 border-amber-500/50 hover:border-amber-400 shadow-2xl backdrop-blur-md transition-all active:scale-95 hover:shadow-amber-500/20"
          title="Talk to the Beagle (Voice or Text Request)"
          aria-label="Talk to the Beagle"
        >
          {/* Pulsing subtle glow behind the button */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 opacity-30 group-hover:opacity-60 blur transition-all duration-300 pointer-events-none" />

          {/* Scout Beagle Avatar / Mic Icon Container */}
          <div className="relative h-7 w-7 rounded-full overflow-hidden border border-amber-400/80 bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <img
              src="/scout.png"
              alt="Scout"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <Mic className="w-3.5 h-3.5 text-amber-400 absolute group-hover:scale-110 transition-transform" />
          </div>

          {/* Text Label */}
          <div className="relative flex items-center gap-1.5 font-black text-xs tracking-tight text-white pr-1">
            <span>Talk to the Beagle</span>
            <Sparkles className="w-3 h-3 text-amber-400 group-hover:rotate-12 transition-transform" />
          </div>
        </button>
      </div>

      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
