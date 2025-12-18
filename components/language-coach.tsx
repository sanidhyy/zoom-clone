"use client";

import { useEffect, useState } from "react";
import { Sparkles, Lightbulb, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageCoachProps {
  transcript: string;
  isEnabled: boolean;
}

interface CoachTip {
  type: "grammar" | "vocabulary" | "tip";
  original: string;
  suggestion: string;
  explanation: string;
}

export const LanguageCoach = ({ transcript, isEnabled }: LanguageCoachProps) => {
  const [tip, setTip] = useState<CoachTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isEnabled || !transcript || transcript.length < 20) return;

    const analyzeTranscript = async () => {
      try {
        const res = await fetch("/api/meetings/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript }),
        });
        const data = await res.json();
        if (data.tip) {
          setTip(data.tip);
          setIsVisible(true);
          // Auto-hide after 15 seconds
          setTimeout(() => setIsVisible(false), 15000);
        }
      } catch (err) {
        console.error("Coach analysis error:", err);
      }
    };

    // Analyze every few significant phrases
    const timeout = setTimeout(analyzeTranscript, 2000);
    return () => clearTimeout(timeout);
  }, [transcript, isEnabled]);

  if (!isEnabled || !isVisible || !tip) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-500 max-w-sm">
      <div className="bg-[#1C1F2E]/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-blue-400">
            <GraduationCap size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Language Coach</span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            title="Close Tip"
            className="text-white/20 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              {tip.type === "grammar" ? <Sparkles size={14} className="text-purple-400" /> : <Lightbulb size={14} className="text-yellow-400" />}
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold leading-none mb-1">
                {tip.type === "grammar" ? "Grammar Check" : "Vocabulary Boost"}
              </p>
              <p className="text-white/60 text-xs italic line-through decoration-red-500/50 mb-1">
                "{tip.original}"
              </p>
              <p className="text-white text-sm font-medium mb-1">
                <span className="text-green-400">Try:</span> "{tip.suggestion}"
              </p>
              <p className="text-white/50 text-[11px] leading-relaxed">
                {tip.explanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
