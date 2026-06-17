import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { topic, sourceText, quantity = 5 } = await req.json();

    let apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1";

    // Bypass shell environment overrides (e.g. invalid keys in global shell)
    // by explicitly parsing the project's .env.local file if it exists.
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const match = envContent.match(/^DEEPSEEK_API_KEY\s*=\s*(.*)$/m);
        if (match && match[1]) {
          const keyVal = match[1].trim();
          if (keyVal && keyVal !== "your_deepseek_api_key_here") {
            apiKey = keyVal;
          }
        }
      }
    } catch (e) {
      console.error("Error reading .env.local file directly:", e);
    }

    if (!apiKey || apiKey === "your_deepseek_api_key_here") {
      // Return mock data for testing if API key is not configured
      console.warn("DeepSeek API key is not configured. Returning mock data.");
      return NextResponse.json(getMockData(topic || "Sample Topic", quantity));
    }

    const systemPrompt = `You are a professional educator. Generate a set of ${quantity} high-quality, clear, and comprehensive study flashcards based on the user's topic or text.
Return your response ONLY as a JSON object conforming strictly to this v1.1 metadata-enriched schema:
{
  "metadata": {
    "version": "1.1",
    "generator": "Excelerate Flashcard Engine",
    "createdAt": ${Date.now()},
    "topic": "the main core topic or subject extracted",
    "totalCards": ${quantity}
  },
  "name": "Name of the Deck (short and concise)",
  "description": "A brief description of what this deck covers (1-2 sentences)",
  "cards": [
    {
      "front": "A clear, concise question or prompt (1 sentence)",
      "back": "A complete, accurate answer or explanation (1-2 sentences)"
    }
  ]
}
Each card's front must be a distinct concept, and the back must explain it clearly. Do not return any markdown formatting, backticks, or conversational text. Just the raw JSON.`;

    const userPrompt = sourceText 
      ? `Generate cards based on this source text:\n\n${sourceText}`
      : `Generate cards about this topic: ${topic}`;

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from DeepSeek API");
    }

    try {
      const parsedData = JSON.parse(content);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse DeepSeek response as JSON:", content);
      throw new Error("DeepSeek response was not valid JSON");
    }
  } catch (error: any) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}

function getMockData(topic: string, quantity: number) {
  const cards = Array.from({ length: quantity }).map((_, i) => ({
    front: `Mock Question ${i + 1} about "${topic}"?`,
    back: `This is a mock answer for question ${i + 1}. To see real AI-generated cards, configure a valid DEEPSEEK_API_KEY in .env.local.`,
  }));

  return {
    metadata: {
      version: "1.1",
      generator: "Excelerate Flashcard Engine (Mock)",
      createdAt: Date.now(),
      topic: topic,
      totalCards: quantity,
    },
    name: `${topic} (Demo)`,
    description: `A demo flashcard deck generated for "${topic}".`,
    cards,
  };
}
