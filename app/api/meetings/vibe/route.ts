import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeSentiment } from "@/lib/ai/sentiment";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    // 1. Fetch last 5 transcripts to analyze the current vibe
    const { data: transcripts, error: fetchError } = await supabase
      .from("transcripts")
      .select("original_text")
      .eq("session_id", session_id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json({ vibe: "Neutral", message: "Awaiting conversation..." });
    }

    // 2. Combine text for sentiment analysis
    const textToAnalyze = transcripts.map((t) => t.original_text).join(" ");
    
    // 3. Analyze vibe
    const vibe = await analyzeSentiment(textToAnalyze);

    return NextResponse.json({
      success: true,
      vibe,
      count: transcripts.length
    });

  } catch (err) {
    console.error("Vibe analysis error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
