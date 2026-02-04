import OpenAI from 'openai';

// Initialize OpenRouter client
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
  
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "RepoInfo - Repository Analysis Tool",
    },
  });
}

// Safe wrapper for OpenRouter generation
export async function safeGenerateContent(prompt: string, preferredModel?: string) {
  const model = preferredModel || 'openrouter/free';
  const client = getOpenRouterClient();

  try {
    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Return in a format compatible with the existing Gemini code
    return {
      response: {
        text: () => text,
      },
    };
  } catch (error: any) {
    console.error(`OpenRouter API error with model ${model}:`, error.message);
    throw error;
  }
}

// Export for compatibility
export { getOpenRouterClient as getModel };
