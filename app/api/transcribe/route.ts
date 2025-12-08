import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!;

// Validate API key and get user
async function validateApiKey(apiKey: string) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, is_active")
    .eq("api_key", apiKey)
    .single();

  if (error || !data || !data.is_active) {
    return null;
  }

  // Update last used timestamp
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("api_key", apiKey);

  return data.user_id;
}

// POST - Transcribe audio using Deepgram
export async function POST(req: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const userId = await validateApiKey(apiKey);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    // Get audio from request
    const contentType = req.headers.get("content-type") || "";
    let audioData: ArrayBuffer;
    let audioMimeType = "audio/wav";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File;

      if (!audioFile) {
        return NextResponse.json(
          { error: "No audio file provided" },
          { status: 400 }
        );
      }

      audioData = await audioFile.arrayBuffer();
      audioMimeType = audioFile.type || "audio/wav";
    } else {
      audioData = await req.arrayBuffer();
      if (contentType.includes("audio/")) {
        audioMimeType = contentType.split(";")[0];
      }
    }

    // Call Deepgram API
    const deepgramResponse = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": audioMimeType,
        },
        body: audioData,
      }
    );

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      console.error("Deepgram error:", errorText);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    const deepgramResult = await deepgramResponse.json();
    const transcript =
      deepgramResult.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
      "";
    const confidence =
      deepgramResult.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

    // Save transcript to Supabase
    const { error: saveError } = await supabase.from("transcriptions").insert({
      user_id: userId,
      text: transcript,
      language: "en",
      confidence: confidence,
    });

    if (saveError) {
      console.error("Failed to save transcript:", saveError);
    }

    // Return Eburon-branded response
    return NextResponse.json({
      success: true,
      data: {
        transcript: transcript,
        confidence: confidence,
        language: "en",
        duration: deepgramResult.metadata?.duration || 0,
      },
      provider: "Eburon Transcription",
      version: "1.0",
    });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
