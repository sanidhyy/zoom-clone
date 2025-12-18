"use client";

import { useUser } from "@clerk/nextjs";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useState, use, useEffect } from "react";

import { Loader } from "@/components/loader";
import { MeetingRoom } from "@/components/meeting-room";
import { MeetingSetup } from "@/components/meeting-setup";
import { useGetCallById } from "@/hooks/use-get-call-by-id";

type MeetingIdPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const MeetingIdPage = ({ params }: MeetingIdPageProps) => {
  const { id } = use(params);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const savedSetup = localStorage.getItem(`setup_complete_${id}`);
    if (savedSetup === "true") {
      setIsSetupComplete(true);
    }
  }, [id]);

  useEffect(() => {
    if (isSetupComplete) {
      localStorage.setItem(`setup_complete_${id}`, "true");
    }
  }, [isSetupComplete, id]);

  const { call, isCallLoading } = useGetCallById(id);

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

