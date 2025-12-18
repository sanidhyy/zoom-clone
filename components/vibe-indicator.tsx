"use client";

import { useEffect, useState } from "react";
import { SentimentVibe } from "@/lib/ai/sentiment";
import { Smile, Frown, Zap, Target, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface VibeIndicatorProps {
  sessionId: string;
}

export const VibeIndicator = ({ sessionId }: VibeIndicatorProps) => {
  const [vibe, setVibe] = useState<SentimentVibe>("Neutral");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchVibe = async () => {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/meetings/vibe?session_id=${sessionId}`);
        const data = await res.json();
        if (data.success) {
          setVibe(data.vibe);
        }
      } catch (err) {
        console.error("Failed to fetch vibe:", err);
      } finally {
        setTimeout(() => setIsUpdating(false), 1000);
      }
    };

    // Poll every 30 seconds for vibe updates
    const interval = setInterval(fetchVibe, 30000);
    fetchVibe(); // Initial fetch

    return () => clearInterval(interval);
  }, [sessionId]);

  const getVibeConfig = (v: SentimentVibe) => {
    switch (v) {
      case "Positive":
        return { icon: Smile, color: "text-green-400", bg: "bg-green-400/10", label: "Positive" };
      case "Excited":
        return { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Excited" };
      case "Tense":
        return { icon: Frown, color: "text-red-400", bg: "bg-red-400/10", label: "Tense" };
      case "Productive":
        return { icon: Target, color: "text-blue-400", bg: "bg-blue-400/10", label: "Productive" };
      default:
        return { icon: MessageSquare, color: "text-blue-200", bg: "bg-white/5", label: "Neutral" };
    }
  };

  const config = getVibeConfig(vibe);
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-700",
      config.bg,
      isUpdating ? "opacity-50" : "opacity-100"
    )}>
      <div className={cn("relative flex items-center justify-center", config.color)}>
        <Icon size={16} />
        {vibe !== "Neutral" && (
           <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.color.replace("text-", "bg-"))}></span>
            <span className={cn("relative inline-flex rounded-full h-2 w-2", config.color.replace("text-", "bg-"))}></span>
          </span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold leading-none">Meeting Vibe</span>
        <span className={cn("text-xs font-semibold leading-tight", config.color)}>
          {config.label}
        </span>
      </div>
    </div>
  );
};
