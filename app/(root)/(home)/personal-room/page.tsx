"use client";

import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useGetCallById } from "@/hooks/use-get-call-by-id";

type TableProps = {
  title: string;
  description: string;
};

const Table = ({ title, description }: TableProps) => (
  <div className="flex flex-col items-start gap-2 xl:flex-row">
    <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
      {title}:
    </h1>
    <p className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
      {description}
    </p>
  </div>
);

const PersonalRoomPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const streamClient = useStreamVideoClient();

  const meetingId = user?.id;
  const { call } = useGetCallById(meetingId!);

  if (!user || !user?.username || !user?.id || !isLoaded) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`;

  const startRoom = async () => {
    if (!streamClient || !user || !user?.id) return;

    if (!call) {
      const newCall = streamClient.call("default", meetingId!);
      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });
    }

    router.push(`/meeting/${meetingId}?personal=true`);
  };

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Personal Room</h1>

      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Meeting ID" description={meetingId!} />
        <Table title="Topic" description={`${user?.username}'s Meeting Room`} />
        <Table title="Invite link" description={meetingLink} />
      </div>

      <div className="flex gap-5">
        <Button className="bg-blue-1" onClick={startRoom}>
          Start Meeting
        </Button>

        <Button
          className="bg-dark-3"
          onClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({
              title: "Link copied.",
            });
          }}
        >
          Copy invitation
        </Button>
      </div>
    </section>
  );
};

export default PersonalRoomPage;
