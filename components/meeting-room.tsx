"use client";

import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import {
  LayoutList,
  Users,
  Mic,
  MicOff,
  FastForward,
  Languages,
  FileText,
  GraduationCap,
  Calendar,
  PenTool,
  Search,
  Headset,
  Sparkles,
  Settings
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranscription } from "@/hooks/use-transcription";

import { EndCallButton } from "./end-call-button";
import { Loader } from "./loader";
import { LiveCaptions, CaptionsToggleButton } from "./live-captions";
import { useGeminiLive } from "@/hooks/use-gemini-live";
import { TranslatorOrbs } from "./translator-orbs";
import { MeetingSummaryModal } from "./modals/meeting-summary-modal";
import { VibeIndicator } from "./vibe-indicator";
import { LanguageCoach } from "./language-coach";
import { SmartSchedulingModal } from "./modals/smart-scheduling-modal";
import { AIWhiteboard } from "./ai-whiteboard";
import { ContextualSearch } from "./contextual-search";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

export const MeetingRoom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const call = useCall();
  const { user } = useUser();
  const [showParticipants, setShowParticipants] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");

  const meetingId = call?.id || "";
  const userName = user?.firstName || user?.username || "Unknown";

  useEffect(() => {
    if (meetingId) {
      localStorage.setItem("active_meeting_id", meetingId);
    }
  }, [meetingId]);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const isPersonalRoom = !!searchParams.get("personal");

  // Live transcription with API key and meeting ID
  const {
    isEnabled: captionsEnabled,
    isConnecting: captionsConnecting,
    transcripts,
    currentText,
    toggleTranscription,
  } = useTranscription({ meetingId, userName, call });

  // Gemini Live Translator
  const {
    mode: geminiMode,
    orbState,
    isConnecting: geminiConnecting,
    transcripts: geminiTranscripts,
    currentText: geminiCurrentText,
    toggleA,
    toggleB,
    skipTurn,
  } = useGeminiLive({ call, meetingId });

  // Determine which transcripts to show
  const activeTranscripts = geminiMode !== "IDLE" ? geminiTranscripts : transcripts;
  const activeCurrentText = geminiMode !== "IDLE" ? geminiCurrentText : currentText;
  const activeCaptionsEnabled = geminiMode !== "IDLE" ? true : captionsEnabled;
  const activeCaptionsConnecting = geminiMode !== "IDLE" ? geminiConnecting : captionsConnecting;

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden text-white">
      <div className="relative flex size-full bg-dark-1 overflow-hidden">
        <div className="flex size-full items-center">
          <CallLayout />
        </div>

        <div
          className={cn("hidden h-[calc(100vh_-_86px)]", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Translator Orbs Overlay */}
      {geminiMode !== "IDLE" && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-4">
          <TranslatorOrbs state={orbState} />
        </div>
      )}

      {/* Live Captions Overlay */}
      <LiveCaptions
        isEnabled={activeCaptionsEnabled}
        isConnecting={activeCaptionsConnecting}
        transcripts={activeTranscripts}
        currentText={activeCurrentText}
        onToggle={toggleTranscription}
      />

      <div className="fixed bottom-0 flex w-full flex-wrap items-center justify-center gap-3 pb-4">
        <CallControls onLeave={() => router.push("/")} />

        {/* Captions Toggle */}
        <CaptionsToggleButton
          isEnabled={captionsEnabled}
          isConnecting={captionsConnecting}
          onClick={toggleTranscription}
        />

        {/* Translator Controls */}
        <div className="flex items-center gap-2 glassmorphism p-1 rounded-full">
          <button
            onClick={toggleA}
            disabled={geminiConnecting || (geminiMode !== "IDLE" && geminiMode !== "A_SPEAK")}
            title="A Speak: Translate your voice to others"
            aria-label="A Speak: Translate your voice to others"
            className={cn(
              "cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500",
              geminiMode === "A_SPEAK" 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110 active:scale-95" 
                : "hover:bg-white/10 text-white/50 hover:text-white"
            )}
          >
            <Mic size={18} className={cn("transition-transform duration-500", geminiMode === "A_SPEAK" && "animate-pulse")} />
            <span className="ml-1 text-[10px] font-bold">A</span>
          </button>
          
          <button
            onClick={toggleB}
            disabled={geminiConnecting || (geminiMode !== "IDLE" && geminiMode !== "B_SPEAK")}
            title="B Speak: Listen to professional AI translation"
            className={cn(
              "cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500",
              geminiMode === "B_SPEAK" 
                ? "bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110 active:scale-95" 
                : "hover:bg-white/10 text-white/50 hover:text-white"
            )}
          >
            <Headset size={18} className={cn("transition-transform duration-500", geminiMode === "B_SPEAK" && "animate-pulse")} />
            <span className="ml-1 text-[10px] font-bold">B</span>
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <button
            onClick={() => setIsLearningMode(!isLearningMode)}
            title={isLearningMode ? "Disable Learning Mode" : "Enable Learning Mode"}
            className={cn(
              "cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300",
              isLearningMode ? "text-blue-400 bg-blue-500/10" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <GraduationCap size={18} />
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            title="Contextual Search"
            className="cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 text-white/50 hover:text-white hover:bg-white/5"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => setIsWhiteboardOpen(true)}
            title="AI Interactive Whiteboard"
            className="cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 text-white/50 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-90"
          >
            <PenTool size={18} />
          </button>

          <button
            onClick={() => setIsSchedulingModalOpen(true)}
            title="Eburon Smart Scheduling"
            className="cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 text-white/50 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-90"
          >
            <Calendar size={18} />
          </button>

          <button
            onClick={() => setIsSummaryModalOpen(true)}
            title="AI Meeting Intelligence & Summaries"
            className="cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 text-white/50 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-90"
          >
            <Sparkles size={18} className="text-amber-400" />
          </button>

          <button
            onClick={skipTurn}
            disabled={orbState !== "TRANSLATING"}
            title="Skip current translation"
            className={cn(
              "cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300",
              orbState === "TRANSLATING"
                ? "text-red-400 hover:text-red-300 hover:bg-white/5"
                : "text-white/20 cursor-not-allowed"
            )}
          >
            <FastForward size={18} />
          </button>

          {user?.primaryEmailAddress?.emailAddress === "developer@eburon.ai" && (
            <button
              onClick={() => router.push("/settings/server")}
              title="Admin Server Settings"
              className="cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-500 text-white/50 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-90"
            >
              <Settings size={18} />
            </button>
          )}
        </div>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger
              className="cursor-pointer rounded-full w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              title="Call layout"
              aria-label="Call layout"
            >
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-white/10 bg-black/90 backdrop-blur-xl text-white">
            {["Grid", "Speaker Left", "Speaker Right"].map((item, i) => (
              <div key={item + "-" + i}>
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/10"
                  onClick={() =>
                    setLayout(
                      item.toLowerCase().replace(" ", "-") as CallLayoutType
                    )
                  }
                >
                  {item}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallStatsButton />

        <button
          onClick={() =>
            setShowParticipants((prevShowParticipants) => !prevShowParticipants)
          }
          title="Show participants"
          className="cursor-pointer rounded-full w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Users size={20} className="text-white" />
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </div>
  );
};

