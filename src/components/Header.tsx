import React from "react";
import { Sparkles, TrendingUp, Cpu, Heart, AlertCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  generationCount: number;
  maxGenerations: number;
  savedCount: number;
  onResetCredits: () => void;
  onViewPricing: () => void;
}

export default function Header({
  generationCount,
  maxGenerations,
  savedCount,
  onResetCredits,
  onViewPricing,
}: HeaderProps) {
  const creditsLeft = Math.max(0, maxGenerations - generationCount);
  const creditPercent = (generationCount / maxGenerations) * 100;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent">
                CreatorBoost
              </span>
              <span className="text-xs font-bold font-mono tracking-widest px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                AI MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">Viral Content Generator Engine</p>
          </div>
        </div>

        {/* Dynamic Metric Meters */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto justify-end">
          {/* Daily Credits Display */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs text-slate-400 font-medium">Daily Generations:</span>
                <span className={`text-xs font-mono font-bold ${creditsLeft <= 2 ? "text-rose-400" : "text-emerald-400"}`}>
                  {creditsLeft} Left
                </span>
              </div>
              {/* Custom Mini Progress Bar */}
              <div className="w-28 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    creditsLeft <= 2 ? "bg-rose-500" : "bg-gradient-to-r from-violet-500 to-purple-500"
                  }`}
                  style={{ width: `${Math.min(100, creditPercent)}%` }}
                />
              </div>
            </div>
            
            {/* Reset Credit Button (for user ease in testing) */}
            <button
              onClick={onResetCredits}
              className="p-1.5 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
              title="Demo Rule: Click to reset 10/10 daily credits value"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Saved Items Metric */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
            <div className="text-left leading-none">
              <span className="block text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Saved Studio</span>
              <span className="text-sm font-mono font-bold text-slate-200">{savedCount} Items</span>
            </div>
          </div>

          {/* Upgrade Banner Button */}
          <button
            onClick={onViewPricing}
            className="group relative px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-md shadow-pink-500/10 hover:shadow-pink-500/25 active:scale-95 transition-all overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              Go Pro · ₹299
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </header>
  );
}
