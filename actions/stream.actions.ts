"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const user = await currentUser();

  if (!user || !user?.id) throw new Error("Unauthorized.");
  if (!apiKey) throw new Error("Stream api key missing.");
  if (!apiSecret) throw new Error("Stream api secret missing.");

  const streamClient = new StreamClient(apiKey, apiSecret);

  // token is valid for an hour
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.createToken(user.id, exp, issued);

  return token;
};
