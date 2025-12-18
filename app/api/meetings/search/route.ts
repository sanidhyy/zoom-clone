import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { session_id, query } = await req.json();

    if (!session_id || !query) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch transcripts to search over
    // In a real powerhouse, we would use vector search, but here we scan recent transcripts
    const { data: transcripts, error: fetchError } = await supabase
      .from("transcripts")
      .select("*")
      .eq("session_id", session_id)
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;

    if (!transcripts || transcripts.length === 0) {
      return NextResponse.json({ answer: "No transcript data available for this session yet." });
    }

    const fullTranscript = transcripts
      .map((t) => `${t.user_name}: ${t.original_text}`)
      .join("\n");

    // 2. Use Gemini to answer based on the context
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert Meeting Assistant. Answer the following question based ONLY on the provided meeting transcript.
      If the answer is not in the transcript, say "I don't have enough information from the current conversation to answer that."
      
      Question: "${query}"
      
      Transcript:
      ${fullTranscript}
    `;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // 3. Simple fuzzy search for source citations
    const sources = transcripts
      .filter((t) => t.original_text.toLowerCase().includes(query.toLowerCase().split(" ")[0]))
      .slice(0, 3);

    return NextResponse.json({ 
      success: true, 
      answer,
      sources 
    });

  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
