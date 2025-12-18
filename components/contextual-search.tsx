"use client";

import { useState } from "react";
import { 
  Search, 
  X, 
  MessageSquare, 
  History, 
  Loader2,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContextualSearchProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const ContextualSearch = ({ 
  isOpen, 
  onClose, 
  sessionId 
}: ContextualSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/meetings/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, query }),
      });
      const data = await res.json();
      setAnswer(data.answer);
      setResults(data.sources || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[400px] bg-[#1C1F2E]/95 backdrop-blur-2xl border-l border-white/10 z-[70] flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Search size={20} />
          </div>
          <h2 className="text-xl font-semibold text-white">Meeting Intelligence</h2>
        </div>
        <button 
            onClick={onClose}
            title="Close Search"
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="relative">
          <Input 
            placeholder="Ask anything about this meeting..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-white/5 border-white/10 text-white pl-10 h-12 rounded-xl focus-visible:ring-blue-500"
          />
          <Search className="absolute left-3.5 top-3.5 text-white/20" size={18} />
          {query && !isLoading && (
             <button 
                onClick={handleSearch}
                title="Run Search"
                className="absolute right-2 top-2 p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all shadow-lg shadow-blue-500/20"
             >
                <ArrowRight size={16} />
             </button>
          )}
          {isLoading && <Loader2 className="absolute right-3 top-3.5 animate-spin text-blue-500" size={18} />}
        </div>

        {answer && (
           <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Sparkles size={10} />
                    AI Answer
                 </p>
                 <p className="text-sm text-white/80 leading-relaxed font-medium">
                    {answer}
                 </p>
              </div>

              {results.length > 0 && (
                 <div className="space-y-3">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-1">Related Transcripts</p>
                    {results.map((res, idx) => (
                       <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group">
                          <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                                   {res.user_name?.[0] || "U"}
                                </div>
                                <span className="text-xs font-semibold text-white/60">{res.user_name}</span>
                             </div>
                             <span className="text-[10px] text-white/20 font-mono">14:02:{idx}</span>
                          </div>
                          <p className="text-xs text-white/40 leading-relaxed italic line-clamp-2">
                             "{res.original_text}"
                          </p>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}

        {!answer && !isLoading && (
           <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4 pt-12">
              <History size={48} className="text-white/20" />
              <div>
                 <p className="text-sm font-semibold">Ready to assist</p>
                 <p className="text-xs mt-1 px-8">Query decisions, action items, or specific topics discussed during this session.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4 px-4">
                 {["Summarize the main points", "What are the action items?", "What was discussed about budget?"].map((suggestion) => (
                    <button
                       key={suggestion}
                       onClick={() => { setQuery(suggestion); }}
                       className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-white/60"
                    >
                       {suggestion}
                    </button>
                 ))}
              </div>
           </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
         <p className="text-[9px] text-white/20 text-center uppercase tracking-[0.2em]">Powered by Eburon AI Core</p>
      </div>
    </div>
  );
};

const Sparkles = ({ size, className }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
