import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveCaptionsProps {
  isEnabled: boolean;
  isConnecting: boolean;
  transcripts: Array<{
    id: string;
    text: string;
    isFinal: boolean;
    timestamp: Date;
  }>;
  currentText: string;
  onToggle: () => void;
}

const TypedText = ({ text, className, onComplete }: { text: string; className?: string; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const lastTextRef = useRef("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update queue when source text changes
  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setQueue([]);
      lastTextRef.current = "";
      return;
    }

    // If text was reset or changed significantly (e.g. new segment)
    if (text.length < lastTextRef.current.length || !text.startsWith(lastTextRef.current)) {
      setDisplayedText("");
      setQueue(text.split(""));
      lastTextRef.current = text;
      return;
    }

    // Append new characters to queue
    if (text.length > lastTextRef.current.length) {
      const newChars = text.slice(lastTextRef.current.length).split("");
      setQueue(prev => [...prev, ...newChars]);
      lastTextRef.current = text;
    }
  }, [text]);

  // Process queue
  useEffect(() => {
    if (queue.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const nextChar = queue[0];
    
    // Calculate delay
    let delay = 50; // Base speed: ~150 WPM

    // Dynamic catch-up
    if (queue.length > 30) delay = 5;
    else if (queue.length > 15) delay = 15;
    else if (queue.length > 5) delay = 25;

    // Natural pauses
    if (/[.!?,]/.test(nextChar)) delay += 150;
    else if (nextChar === " ") delay += 30;

    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + nextChar);
      setQueue(prev => prev.slice(1));
    }, delay);

    return () => clearTimeout(timer);
  }, [queue, onComplete]);

  return <span className={className}>{displayedText}</span>;
};

export const LiveCaptions = ({
  isEnabled,
  isConnecting,
  transcripts,
  currentText,
  onToggle,
}: LiveCaptionsProps) => {
  if (!isEnabled && !isConnecting) {
    return null;
  }

  // Get last 4 transcripts for a richer feed
  const recentTranscripts = transcripts.slice(-4);
  const hasContent = recentTranscripts.length > 0 || currentText;

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-6 pointer-events-none">
      <div
        className={cn(
          "bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden transition-all duration-500 transform",
          hasContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        )}
      >
        {/* Caption Content */}
        <div className="p-6 min-h-[80px] max-h-[160px] overflow-y-auto scrollbar-hide flex flex-col justify-end">
          {isConnecting ? (
            <div className="flex items-center justify-center gap-3 text-white/40">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              </div>
              <span className="text-sm font-medium tracking-wide uppercase">Establishing Secure Feed...</span>
            </div>
          ) : hasContent ? (
            <div className="space-y-3">
              {recentTranscripts.map((t, i) => (
                <p 
                  key={t.id} 
                  className={cn(
                    "text-white text-lg font-medium leading-tight animate-in fade-in slide-in-from-bottom-2 duration-500",
                    i < recentTranscripts.length - 1 ? "opacity-30 text-base" : "opacity-90"
                  )}
                >
                  <TypedText text={t.text} />
                </p>
              ))}
              {currentText && (
                <p className="text-blue-400 text-lg font-semibold leading-tight animate-pulse flex items-center gap-1.5 flex-wrap">
                  <TypedText text={currentText} />
                  <span className="inline-block w-1.5 h-5 bg-blue-500/50 rounded-full animate-caret-blink" />
                </p>
              )}
            </div>
          ) : (
            <p className="text-white/20 text-sm font-medium text-center uppercase tracking-widest">
              Awaiting Signal...
            </p>
          )}
        </div>

        {/* Caption Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-1 text-lg filled">
              closed_caption
            </span>
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
              Live Captions
            </span>
            {isEnabled && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs">LIVE</span>
              </span>
            )}
          </div>
          
          <button
            onClick={onToggle}
            className="text-white/60 hover:text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// CC Toggle Button Component
export const CaptionsToggleButton = ({
  isEnabled,
  isConnecting,
  onClick,
}: {
  isEnabled: boolean;
  isConnecting: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isConnecting}
      title={isEnabled ? "Turn off captions" : "Turn on captions"}
      className={cn(
        "relative cursor-pointer rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300",
        isEnabled
          ? "bg-white text-black"
          : "bg-white/10 text-white hover:bg-white/20",
        isConnecting && "opacity-50 cursor-wait"
      )}
    >
      <span className={cn(
        "material-symbols-rounded text-xl",
        isEnabled && "filled"
      )}>
        closed_caption
      </span>
      
      {isEnabled && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
};
