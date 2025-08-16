import { GoogleGenAI } from "@google/genai";

// Debug: check if Gemini API key is loaded
console.log("GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY);

// Initialize Gemini client
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // Call Gemini model
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return new Response(
      JSON.stringify({
        response: response.text,
        modelUsed: "gemini-2.5-flash",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gemini API request error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
