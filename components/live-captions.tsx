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

const TypedText = ({ text, className }: { text: string; className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    // If text changed, we want to start from where we are and catch up
    // However, for interim transcripts, they often change RAPIDLY as STT refines it.
    // To keep it feeling "human", we only append if the new text starts with the old text,
    // or we jump forward if it's a completely new sentence/segment.
    
    // Simplest robust way for live STT: 
    // If the target text is longer than displayed, type forward.
    // If it's shorter (STT refinement correction), adjust immediately to avoid "deletion" animations which look jarring.
    
    if (text.length < displayedText.length || !text.startsWith(displayedText)) {
      setDisplayedText(text);
      return;
    }

    if (displayedText.length < text.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      const typeNext = () => {
        setDisplayedText(prev => {
          if (prev.length < text.length) {
            // Take the next character
            return text.slice(0, prev.length + 1);
          }
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        });
      };

      // Natural speed: roughly 50ms per char, but faster if gap is large
      const gap = text.length - displayedText.length;
      const speed = gap > 20 ? 10 : gap > 10 ? 30 : 50;

      intervalRef.current = setInterval(typeNext, speed);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, displayedText]);

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
                  {t.text}
                </p>
              ))}
              {currentText && (
                <p className="text-blue-400 text-lg font-semibold leading-tight animate-pulse">
                  <TypedText text={currentText} />
                  <span className="inline-block w-1.5 h-5 ml-1 bg-blue-500/50 rounded-full animate-caret-blink align-middle" />
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
