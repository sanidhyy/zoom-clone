import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

// Validate API key
async function validateApiKey(apiKey: string) {
  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id, is_active")
    .eq("api_key", apiKey)
    .single();

  if (error || !data || !data.is_active) {
    return null;
  }

  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("api_key", apiKey);

  return data.user_id;
}

// GET - Fetch live transcription for a meeting
export async function GET(req: NextRequest) {
  try {
    // Validate API key
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

    // Get meeting ID from query params or header
    const meetingId =
      req.nextUrl.searchParams.get("meeting_id") ||
      req.headers.get("x-meeting-id");

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meeting_id parameter" },
        { status: 400 }
      );
    }

    // Optional: get transcripts after a certain timestamp for polling
    const since = req.nextUrl.searchParams.get("since");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

    // Query transcriptions for this meeting
    let query = supabase
      .from("transcriptions")
      .select("id, text, language, confidence, created_at, user_name")
      .eq("meeting_id", meetingId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (since) {
      query = query.gt("created_at", since);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch transcriptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch transcriptions" },
        { status: 500 }
      );
    }

    // Combine transcripts into full text
    const fullText = data?.map((t) => t.text).join(" ") || "";

    return NextResponse.json({
      success: true,
      data: {
        meetingId: meetingId,
        transcripts: data || [],
        fullText: fullText,
        count: data?.length || 0,
        lastUpdated: data?.length ? data[data.length - 1].created_at : null,
      },
      provider: "Eburon Transcription",
      version: "1.0",
    });
  } catch (err) {
    console.error("Live transcription error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add transcription to a meeting (for internal use)
export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const { meeting_id, text, user_name, language, is_final } = body;

    if (!meeting_id || !text) {
      return NextResponse.json(
        { error: "Missing meeting_id or text" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transcriptions")
      .insert({
        meeting_id,
        user_id: userId,
        user_name: user_name || "Unknown",
        text,
        language: language || "en",
        is_final: is_final ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save transcription:", error);
      return NextResponse.json(
        { error: "Failed to save transcription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        createdAt: data.created_at,
      },
      provider: "Eburon Transcription",
    });
  } catch (err) {
    console.error("Save transcription error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
