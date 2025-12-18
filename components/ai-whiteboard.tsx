"use client";

import { useRef, useState, useEffect } from "react";
import { 
  Eraser, 
  Pencil, 
  Trash2, 
  Sparkles, 
  Download, 
  X,
  Undo2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIWhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIWhiteboard = ({ isOpen, onClose }: AIWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#3b82f6");
  const [lineWidth, setLineWidth] = useState(3);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setHistory((prev) => [...prev, canvasRef.current!.toDataURL()]);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistory([]);
    }
  };

  const enhanceWithAI = async () => {
    if (!canvasRef.current) return;
    setIsEnhancing(true);
    try {
      const imageData = canvasRef.current.toDataURL("image/png");
      const res = await fetch("/api/meetings/whiteboard/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      const data = await res.json();
      if (data.analysis) {
        alert("AI Insights: " + data.analysis);
      }
    } catch (err) {
      console.error("AI Whitboard error:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1C1F2E] w-full max-w-5xl h-[80vh] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400">
              <Pencil size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Assistant Whiteboard</h2>
              <p className="text-xs text-white/40">Collaborate and brainstorm visually</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            title="Close Whiteboard"
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-6 bg-white/[0.01]">
          <div className="flex items-center gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
             {[
               { icon: Pencil, id: "draw", color: "#3b82f6" },
               { icon: Eraser, id: "erase", color: "#1C1F2E" }
             ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setColor(tool.color)}
                  title={tool.id === "draw" ? "Pencil Tool" : "Eraser Tool"}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    color === tool.color ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
                  )}
                >
                  <tool.icon size={18} />
                </button>
             ))}
          </div>

          <div className="flex items-center gap-3">
             {[
               { hex: "#3b82f6", class: "bg-blue-500" },
               { hex: "#ef4444", class: "bg-red-500" },
               { hex: "#10b981", class: "bg-emerald-500" },
               { hex: "#f59e0b", class: "bg-amber-500" },
               { hex: "#ffffff", class: "bg-white" }
             ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={`Switch color to ${c.hex}`}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-125",
                    c.class,
                    color === c.hex ? "border-white scale-110" : "border-transparent"
                  )}
                />
              ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                onClick={clearCanvas}
                className="text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
            >
              <Trash2 size={18} className="mr-2" />
              Clear
            </Button>
            <Button 
                onClick={enhanceWithAI}
                disabled={isEnhancing}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20"
            >
              {isEnhancing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
              AI Enhance
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#10121C] relative group">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-full h-full cursor-crosshair"
          />
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
             <Button variant="secondary" className="bg-dark-1/80 border-white/10 text-white/60 rounded-xl">
               <Download size={16} className="mr-2" />
               Save Draft
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="18"
    height="18"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
