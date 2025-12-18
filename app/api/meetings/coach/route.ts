import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.length < 10) {
       return NextResponse.json({ tip: null });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a helpful AI Language Coach for a business meeting. 
      Analyze the following transcript snippet and provide ONE helpful grammar correction or vocabulary improvement.
      If the text is fine, respond with "NONE".
      
      If you find an improvement, respond with a JSON object:
      {
        "type": "grammar" | "vocabulary",
        "original": "the original phrase",
        "suggestion": "the improved phrase",
        "explanation": "a very short (1 sentence) explanation of why"
      }
      
      Text: "${text}"
    `;

    const result = await model.generateContent(prompt);
    let coachText = result.response.text().trim();
    
    // Clean up markdown if AI includes it
    if (coachText.startsWith("```json")) {
      coachText = coachText.replace(/```json|```/g, "").trim();
    }

    if (coachText === "NONE") {
      return NextResponse.json({ tip: null });
    }

    const tip = JSON.parse(coachText);
    return NextResponse.json({ tip });

  } catch (err) {
    console.error("Coach API error:", err);
    return NextResponse.json({ tip: null });
  }
}
