"use client";

import { useUser } from "@clerk/nextjs";
import { type Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MeetingModal } from "@/components/modals/meeting-modal";
import { useToast } from "@/components/ui/use-toast";

import { HomeCard } from "./home-card";

type MeetingState =
  | "isScheduleMeeting"
  | "isJoiningMeeting"
  | "isInstantMeeting"
  | undefined;

export const MeetingTypeList = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [callDetails, setCallDetails] = useState<Call>();
  const [meetingState, setMeetingState] = useState<MeetingState>(undefined);
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });

  const { user } = useUser();
  const streamClient = useStreamVideoClient();

  const createMeeting = async () => {
    if (!streamClient || !user || !user?.id) return;

    try {
      setIsLoading(true);

      if (!values.dateTime) {
        return toast({
          title: "Please select a date and time.",
          variant: "destructive",
        });
      }

      const id = crypto.randomUUID();
      const call = streamClient.call("default", id);

      if (!call) throw new Error("Failed to create call.");

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetails(call);

      if (!values?.description) {
        router.push(`/meeting/${call.id}`);
      }

      toast({
        title: "Meeting created.",
      });
    } catch (error) {
      console.error("CREATE_MEETING: ", error);

      toast({
        title: "Failed to create meeting.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-orange-1"
      />

      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        handleClick={() => setMeetingState("isScheduleMeeting")}
        className="bg-blue-1"
      />

      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Check out your recordings"
        handleClick={() => router.push("/recordings")}
        className="bg-purple-1"
      />

      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via invitation link"
        handleClick={() => setMeetingState("isJoiningMeeting")}
        className="bg-yellow-1"
      />

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an instant meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
        isLoading={isLoading}
      />
    </section>
  );
};
