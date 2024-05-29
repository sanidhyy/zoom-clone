"use client";

import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useState } from "react";

import { Loader } from "@/components/loader";
import { MeetingRoom } from "@/components/meeting-room";
import { MeetingSetup } from "@/components/meeting-setup";
import { useGetCallById } from "@/hooks/use-get-call-by-id";

type MeetingIdPageProps = {
  params: {
    id: string;
  };
};

const MeetingIdPage = ({ params }: MeetingIdPageProps) => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { user, isLoaded } = useUser();

  const { call, isCallLoading } = useGetCallById(params.id);

  if (!isLoaded || isCallLoading) return <Loader />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingIdPage;
