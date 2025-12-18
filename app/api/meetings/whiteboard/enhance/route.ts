import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // Convert base64 to parts for Gemini
    const base64Data = image.split(",")[1];
    const mimeType = image.split(";")[0].split(":")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an AI Design Assistant. Analyze this whiteboard sketch from a meeting.
      1. Interpret what the user has drawn (e.g. "a diagram of a software architecture", "a funnel chart").
      2. Provide 2-3 bullet points of constructive feedback or "next step" insights based on the sketch.
      Keep it professional and helpful.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ]);

    const analysis = result.response.text();

    return NextResponse.json({ success: true, analysis });

  } catch (err) {
    console.error("Whiteboard AI error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
