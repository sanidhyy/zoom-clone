import { NextResponse } from "next/server";

export async function GET() {
  const voices = {
    pro: {
      provider: "Eburon Pro",
      description: "High-quality emotional TTS",
      voices: [
        {
          id: "0e9bf92b-0a2a-406e-b55e-c1db92ceb9ca",
          name: "Eburon Clone",
          description: "Custom cloned voice",
          language: "English",
          type: "cloned",
        },
        {
          id: "228fca29-3a0a-435c-8728-5cb483251068",
          name: "Sarah",
          description: "Warm, friendly female voice",
          language: "English (US)",
          type: "preset",
        },
        {
          id: "bf991597-6c13-47e4-8411-91ec2de5c466",
          name: "Barbershop Man",
          description: "Deep male voice",
          language: "English (US)",
          type: "preset",
        },
      ],
    },
    beta: {
      provider: "Eburon Basic",
      description: "Free standard neural voices",
      voices: [
        { id: "en-US-AriaNeural", name: "Aria", language: "English (US)", gender: "Female" },
        { id: "en-US-GuyNeural", name: "Guy", language: "English (US)", gender: "Male" },
        { id: "fil-PH-BlessicaNeural", name: "Blessica", language: "Filipino", gender: "Female" },
      ],
    },
    provider: "Eburon TTS",
  };

  return NextResponse.json(voices);
}
