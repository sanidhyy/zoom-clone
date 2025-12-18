"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, Share2 } from "lucide-react";

interface MeetingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const MeetingSummaryModal = ({
  isOpen,
  onClose,
  sessionId,
}: MeetingSummaryModalProps) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/meetings/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate summary");
      
      setSummary(data.summary);
    } catch (err: any) {
      console.error("Summary error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1C1F2E] text-white border-white/10 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <FileText size={20} />
            </div>
            <DialogTitle className="text-xl font-semibold">Meeting Intelligence</DialogTitle>
          </div>
          <DialogDescription className="text-white/60">
            Eburon AI has analyzed your meeting transcripts to generate this summary.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {!summary && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileText className="text-white/20" size={32} />
              </div>
              <h3 className="text-lg font-medium mb-2">No Summary Generated</h3>
              <p className="text-white/40 mb-6 max-w-xs">
                Generate an AI-powered summary with action items based on your conversation.
              </p>
              <Button 
                onClick={generateSummary}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8"
              >
                Generate Summary
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
              <p className="text-white/60 animate-pulse">Analyzing transcriptions...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
              <Button 
                variant="link" 
                className="text-red-400 ml-2 h-auto p-0" 
                onClick={generateSummary}
              >
                Retry
              </Button>
            </div>
          )}

          {summary && (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-white/80 leading-relaxed font-sans">
                {summary}
              </div>
              
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10">
                <Button variant="outline" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
                  <Download size={16} className="mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="secondary" className="rounded-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
