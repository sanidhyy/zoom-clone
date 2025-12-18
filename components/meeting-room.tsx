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
import { LayoutList, Users } from "lucide-react";
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
import { Mic, MicOff, Languages } from "lucide-react";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

export const MeetingRoom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const call = useCall();
  const { user } = useUser();
  const [showParticipants, setShowParticipants] = useState(false);
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
            title="A Speak (Translate your voice to B)"
            className={cn(
              "cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300",
              geminiMode === "A_SPEAK" 
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-105" 
                : "hover:bg-white/5 text-white/50 hover:text-white"
            )}
          >
            <Mic size={18} />
            <span className="ml-1 text-[10px] font-bold">A</span>
          </button>
          
          <button
            onClick={toggleB}
            disabled={geminiConnecting || (geminiMode !== "IDLE" && geminiMode !== "B_SPEAK")}
            title="B Speak (Translate B's voice to you)"
            className={cn(
              "cursor-pointer rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300",
              geminiMode === "B_SPEAK" 
                ? "bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/20 scale-105" 
                : "hover:bg-white/5 text-white/50 hover:text-white"
            )}
          >
            <Mic size={18} />
            <span className="ml-1 text-[10px] font-bold">B</span>
          </button>
        </div>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger
              className="cursor-pointer rounded-full w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              title="Call layout"
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

