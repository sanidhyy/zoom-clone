import MeetingClient from "./meeting-client";

type MeetingIdPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const MeetingIdPage = async ({ params }: MeetingIdPageProps) => {
  const { id } = await params;
  return <MeetingClient id={id} />;
};

export default MeetingIdPage;
