import { NextRequest, NextResponse } from "next/server";

const CARTESIA_API_KEY = process.env.CARTESIA_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { 
      text, 
      voice = "en-US-AriaNeural", 
      tier = "beta", 
      speed = 1.0,
      pro_voice_id = "228fca29-3a0a-435c-8728-5cb483251068"
    } = await req.json();

    if (tier === "pro") {
      const response = await fetch("https://api.cartesia.ai/tts/bytes", {
        method: "POST",
        headers: {
          "Cartesia-Version": "2025-04-16",
          "X-API-Key": CARTESIA_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: "sonic-3",
          transcript: text,
          voice: {
            mode: "id",
            id: pro_voice_id,
          },
          output_format: {
            container: "mp3",
            encoding: "mp3",
            sample_rate: 44100,
          },
          speed: "normal",
          generation_config: {
            speed: speed,
            volume: 1,
          },
        }),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "TTS generation failed" },
          { status: response.status }
        );
      }

      const audioBuffer = await response.arrayBuffer();

      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "X-Eburon-Voice": pro_voice_id,
          "X-Eburon-Provider": "Eburon-Pro",
          "X-Eburon-Tier": "pro",
        },
      });
    }

    // Beta Fallback (Simple placeholder for now)
    return NextResponse.json(
      { error: "Beta tier TTS requires a Python bridge or a Node-compatible provider like OpenAI/Google. For Vercel, please use Pro (Cartesia)." },
      { status: 400 }
    );
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
