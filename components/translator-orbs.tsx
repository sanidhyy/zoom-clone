"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type OrbState = "IDLE" | "LISTENING" | "TRANSLATING";

interface TranslatorOrbsProps {
  state: OrbState;
  className?: string;
}

export const TranslatorOrbs = ({ state, className }: TranslatorOrbsProps) => {
  return (
    <div className={cn("flex items-center justify-center gap-8 py-8", className)}>
      {/* Orb A */}
      <div className="relative">
        <div
          className={cn(
            "w-24 h-24 rounded-full transition-all duration-500 flex items-center justify-center border-2",
            state === "LISTENING"
              ? "bg-blue-600/30 border-blue-500 scale-110 shadow-[0_0_30px_rgba(37,99,235,0.5)]"
              : "bg-white/10 border-white/20 scale-100"
          )}
        >
          {state === "LISTENING" && (
            <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
          )}
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
            A
          </span>
        </div>
        {state === "LISTENING" && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-blue-400 font-bold animate-pulse whitespace-nowrap">
            SPEAKING...
          </div>
        )}
      </div>

      {/* Vector/Arrow between Orbs */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={cn(
            "w-12 h-[2px] rounded-full transition-all duration-500",
            state === "TRANSLATING" ? "bg-purple-500 animate-pulse" : "bg-white/10"
          )}
        />
        {state === "TRANSLATING" && (
          <div className="animate-spin text-purple-400">
             <span className="material-symbols-rounded text-xl">sync</span>
          </div>
        )}
      </div>

      {/* Orb B */}
      <div className="relative">
        <div
          className={cn(
            "w-24 h-24 rounded-full transition-all duration-500 flex items-center justify-center border-2",
            state === "TRANSLATING"
              ? "bg-purple-600/30 border-purple-500 scale-110 shadow-[0_0_30px_rgba(147,51,234,0.5)]"
              : "bg-white/10 border-white/20 scale-100"
          )}
        >
          {state === "TRANSLATING" && (
            <div className="absolute inset-0 rounded-full animate-pulse bg-purple-500/20" />
          )}
          <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
            B
          </span>
        </div>
        {state === "TRANSLATING" && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-purple-400 font-bold animate-bounce whitespace-nowrap">
            TRANSLATING...
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
