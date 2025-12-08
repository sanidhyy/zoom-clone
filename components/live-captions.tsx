"use client";

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

  // Get last 3 transcripts for display
  const recentTranscripts = transcripts.slice(-3);
  const hasContent = recentTranscripts.length > 0 || currentText;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4">
      <div
        className={cn(
          "bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden transition-all duration-300",
          hasContent ? "opacity-100" : "opacity-60"
        )}
      >
        {/* Caption Content */}
        <div className="p-4 min-h-[60px] max-h-[120px] overflow-y-auto">
          {isConnecting ? (
            <div className="flex items-center gap-2 text-white/60">
              <span className="material-symbols-rounded animate-spin text-lg">
                progress_activity
              </span>
              <span className="text-sm">Connecting to live captions...</span>
            </div>
          ) : hasContent ? (
            <div className="space-y-1">
              {recentTranscripts.map((t) => (
                <p key={t.id} className="text-white/80 text-base leading-relaxed">
                  {t.text}
                </p>
              ))}
              {currentText && (
                <p className="text-white/50 text-base leading-relaxed italic">
                  {currentText}
                </p>
              )}
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center">
              Listening for speech...
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
