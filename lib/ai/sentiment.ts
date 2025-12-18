import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type SentimentVibe = "Positive" | "Neutral" | "Tense" | "Productive" | "Excited";

export async function analyzeSentiment(text: string): Promise<SentimentVibe> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Analyze the sentiment and vibe of the following meeting transcript snippet. 
      Respond with ONLY one word from this list: Positive, Neutral, Tense, Productive, Excited.
      
      Transcript: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const vibe = result.response.text().trim() as SentimentVibe;
    
    // Validate response
    const validVibes: SentimentVibe[] = ["Positive", "Neutral", "Tense", "Productive", "Excited"];
    return validVibes.includes(vibe) ? vibe : "Neutral";
  } catch (err) {
    console.error("Sentiment analysis error:", err);
    return "Neutral";
  }
}
