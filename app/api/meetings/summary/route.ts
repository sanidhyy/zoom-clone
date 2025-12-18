import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      );
    }

    // 1. Fetch all transcripts for this session
    const { data: transcripts, error: fetchError } = await supabase
      .from("transcripts")
      .select("user_name, original_text, created_at")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Fetch transcripts error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json(
        { error: "No transcripts found for this session" },
        { status: 404 }
      );
    }

    // 2. Prepare transcript for AI
    const fullTranscript = transcripts
      .map((t) => `${t.user_name}: ${t.original_text}`)
      .join("\n");

    // 3. Generate summary using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert meeting assistant for Eburon AI. 
      Analyze the following meeting transcript and provide a structured summary in Markdown format.
      
      Structure:
      # Meeting Summary
      ## Participants
      ## Key Topics & Decisions
      ## Action Items (bullet points)
      
      Transcript:
      ${fullTranscript}
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // 4. Save summary to Supabase (assuming meeting_summaries table exists)
    // In many development environments, tables are created on the fly if RLS allows or via auto-management.
    // We'll attempt to save and log if there's an issue.
    const { data: summaryData, error: saveError } = await supabase
      .from("meeting_summaries")
      .upsert({
        session_id,
        summary,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.warn("Could not save to meeting_summaries (table might not exist yet):", saveError);
      // Return the summary anyway so the UI can show it
      return NextResponse.json({
        success: true,
        summary,
        saved: false,
        error: "Database save failed, but summary generated."
      });
    }

    return NextResponse.json({
      success: true,
      summary,
      summary_id: summaryData.id,
      saved: true
    });

  } catch (err) {
    console.error("Summary generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
