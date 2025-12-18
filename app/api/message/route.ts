import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "gemini-1.5-flash", tier = "pro" } = await req.json();

    if (tier === "pro") {
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      // Convert messages to Gemini format
      const history = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1].content;

      const chat = geminiModel.startChat({
        history,
      });

      const result = await chat.sendMessage(lastMessage);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({
        success: true,
        message: text,
        model: "gemini-2.0-flash-exp",
        provider: "Eburon Chat",
      });
    }

    // Default to a simple response if not pro or for beta fallback
    return NextResponse.json({
      success: true,
      message: "Chat tier not supported or fallback active.",
      model: "system",
      provider: "Eburon Chat",
    });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
