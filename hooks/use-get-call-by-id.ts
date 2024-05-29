import { useStreamVideoClient, type Call } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);

  const streamClient = useStreamVideoClient();

  useEffect(() => {
    if (!streamClient) return;

    const loadCall = async () => {
      const { calls } = await streamClient.queryCalls({
        filter_conditions: {
          id,
        },
      });

      if (calls.length > 0) setCall(calls[0]);

      setIsCallLoading(false);
    };

    loadCall();
  }, [streamClient, id]);

  return { call, isCallLoading };
};
