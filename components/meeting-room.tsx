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
import { useState } from "react";

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

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

export const MeetingRoom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const call = useCall();
  const { user } = useUser();
  const [showParticipants, setShowParticipants] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const isPersonalRoom = !!searchParams.get("personal");
  const meetingId = call?.id || "";
  const userName = user?.firstName || user?.username || "Unknown";

  // Live transcription with API key and meeting ID
  const {
    isEnabled: captionsEnabled,
    isConnecting: captionsConnecting,
    transcripts,
    currentText,
    toggleTranscription,
  } = useTranscription({ meetingId, userName, call });

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
    <div className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        <div
          className={cn("ml-2 hidden h-[calc(100vh_-_86px)]", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Live Captions Overlay */}
      <LiveCaptions
        isEnabled={captionsEnabled}
        isConnecting={captionsConnecting}
        transcripts={transcripts}
        currentText={currentText}
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

