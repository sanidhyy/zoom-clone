"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return;

  return (
    <div className="">
      <Button
        onClick={async () => {
          await call.endCall();

          router.push("/");
        }}
        className="bg-red-500"
      >
        End call for everyone
      </Button>
    </div>
  );
};
