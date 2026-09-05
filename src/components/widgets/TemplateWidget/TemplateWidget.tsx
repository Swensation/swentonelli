"use client";

import { useState } from "react";
import { Smile, Sparkles, Wand2 } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * 🌟 STARTER TEMPLATE FOR KIDS:
 * You can copy this file to create your own widgets!
 * For example: JokeWidget, ChoreTracker, VacationCountdown, PetStatus!
 */

const JOKES = [
  { q: "Why did the computer take a nap?", a: "Because it had a hard drive! 💻😴" },
  { q: "Why do programmers prefer dark mode?", a: "Because light attracts bugs! 🐛💡" },
  { q: "How does a penguin build its house?", a: "Igloos it together! 🐧❄️" },
  { q: "What do you call cheese that isn't yours?", a: "Nacho Cheese! 🧀" },
];

export function TemplateWidget() {
  const [jokeIndex, setJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);

  const nextJoke = () => {
    setJokeIndex((prev) => (prev + 1) % JOKES.length);
    setShowPunchline(false);
  };

  const handleReveal = () => {
    setShowPunchline(true);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const joke = JOKES[jokeIndex];

  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full bg-slate-900/60 border-slate-700/60">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Smile className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Daily Fun & Joke</h3>
              <p className="text-xs text-slate-400">Kids Custom Widget</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Kid Built 🚀
          </span>
        </div>

        {/* Joke Content */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 text-center space-y-3">
          <p className="text-base md:text-lg font-bold text-white leading-relaxed">
            &ldquo;{joke.q}&rdquo;
          </p>

          {showPunchline ? (
            <div className="p-3 rounded-lg bg-slate-800 border border-amber-500/50 text-amber-300 font-extrabold text-lg transition-all duration-300">
              {joke.a}
            </div>
          ) : (
            <button
              onClick={handleReveal}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs md:text-sm shadow-md active:scale-95 transition-all flex items-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-4 h-4" /> Tap for Punchline!
            </button>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={nextJoke}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5"
        >
          <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Another Joke
        </button>
      </div>
    </div>
  );
}

