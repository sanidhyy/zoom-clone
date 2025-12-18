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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Clock, Sparkles, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface SmartSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartSchedulingModal = ({
  isOpen,
  onClose,
}: SmartSchedulingModalProps) => {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [constraints, setConstraints] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/meetings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", constraints }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to get suggestions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedule = async (time: string) => {
    setIsSaving(true);
    try {
      const date = new Date();
      date.setDate(date.getDate() + 1); // Tomorrow
      const [hours, minutes] = time.split(":");
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const res = await fetch("/api/meetings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          title: title || "New AI Strategy Session",
          date: date.toISOString(),
          userId: user?.id,
        }),
      });

      if (res.ok) {
        setSelectedTime(time);
        setTimeout(() => {
           onClose();
           setSelectedTime(null);
           setTitle("");
           setConstraints("");
           setSuggestions([]);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to save meeting:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1C1F2E] text-white border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Calendar size={20} />
            </div>
            <DialogTitle className="text-xl font-semibold">Smart Scheduling</DialogTitle>
          </div>
          <DialogDescription className="text-white/60">
            Let Eburon AI find the perfect time for your next session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-white/40 uppercase">Meeting Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Weekly Sync" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints" className="text-xs font-semibold text-white/40 uppercase">Your Constraints</Label>
            <div className="relative">
              <Input 
                id="constraints" 
                placeholder="e.g. Afternoon preferred, avoid 3pm" 
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 focus-visible:ring-purple-500"
              />
              <Sparkles className="absolute left-3 top-2.5 text-purple-400/60" size={16} />
            </div>
          </div>

          {!suggestions.length ? (
             <Button 
                onClick={getSuggestions} 
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6"
             >
                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
                Generate Best Times
             </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">AI Suggested Times (Tomorrow)</p>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSchedule(s.time)}
                  disabled={isSaving}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-white/60">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{s.time}</p>
                      <p className="text-[10px] text-white/40">{s.reason}</p>
                    </div>
                  </div>
                  {selectedTime === s.time ? (
                    <Check className="text-green-400 animate-in zoom-in" size={20} />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                  )}
                </button>
              ))}
              <Button 
                variant="link" 
                onClick={() => setSuggestions([])} 
                className="text-purple-400 text-xs p-0 h-auto"
              >
                Change Constraints
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button onClick={onClose} variant="secondary" className="rounded-xl bg-white/5 hover:bg-white/10 border-none text-white/60">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
