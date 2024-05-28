type MeetingIdPageProps = {
  params: {
    id: string;
  };
};

const MeetingIdPage = ({ params }: MeetingIdPageProps) => {
  return <div>Meeting Room Id: {params.id}</div>;
};

export default MeetingIdPage;
