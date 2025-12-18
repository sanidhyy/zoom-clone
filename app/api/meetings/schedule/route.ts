import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { action, title, date, constraints, userId } = await req.json();

    if (action === "suggest") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an AI Scheduling Assistant. Suggest the 3 best meeting times for tomorrow based on these user constraints: "${constraints || "none"}".
        Return a JSON array of objects with "time" (HH:MM), "reason" (short string).
      `;

      const result = await model.generateContent(prompt);
      let suggestionsText = result.response.text().trim();
      
      if (suggestionsText.startsWith("```json")) {
        suggestionsText = suggestionsText.replace(/```json|```/g, "").trim();
      }

      return NextResponse.json({ suggestions: JSON.parse(suggestionsText) });
    }

    if (action === "save") {
       if (!title || !date || !userId) {
         return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
       }

       const { data, error } = await supabase
         .from("scheduled_meetings")
         .insert({
           user_id: userId,
           title,
           scheduled_for: date,
           status: "upcoming"
         })
         .select()
         .single();

       if (error) throw error;

       return NextResponse.json({ success: true, meeting: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err) {
    console.error("Scheduling API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
