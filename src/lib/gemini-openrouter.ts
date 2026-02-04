import OpenAI from 'openai';
import { cacheQuerySelection, getCachedQuerySelection } from "./cache";

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

// Safe wrapper for OpenRouter generation - maintains Gemini API compatibility
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

// Streaming generation function
export async function safeGenerateContentStream(prompt: string, preferredModel?: string) {
  const model = preferredModel || 'openrouter/free';
  const client = getOpenRouterClient();

  try {
    const stream = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    // Return an async iterator compatible with existing code
    return {
      stream: (async function* () {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            yield { text: () => text };
          }
        }
      })(),
    };
  } catch (error: any) {
    console.error(`OpenRouter streaming error with model ${model}:`, error.message);
    throw error;
  }
}

// Export getModel for compatibility (not actually used with OpenRouter)
export function getModel(modelName?: string) {
  return getOpenRouterClient();
}

export async function generateChatResponse(
  history: { role: "user" | "model"; parts: string }[],
  context?: string
) {
  // This function is not heavily used, returning a placeholder
  // If needed, can be expanded to match Gemini's startChat API
  return {
    sendMessage: async (prompt: string) => {
      return await safeGenerateContent(prompt);
    },
  };
}

export async function analyzeFileSelection(
  question: string,
  fileTree: string[],
  owner?: string,
  repo?: string
): Promise<string[]> {
  // 1. SMART BYPASS: Check if the user explicitly mentioned a file
  const mentionedFiles = fileTree.filter(path => {
    const filename = path.split('/').pop();
    if (!filename) return false;
    return question.toLowerCase().includes(filename.toLowerCase());
  });

  if (mentionedFiles.length > 0) {
    console.log("⚡ Smart Bypass: Found mentioned files:", mentionedFiles);
    const commonFiles = ["package.json", "README.md", "tsconfig.json"];
    const additionalContext = fileTree.filter(f => commonFiles.includes(f) && !mentionedFiles.includes(f));
    return [...mentionedFiles, ...additionalContext].slice(0, 10);
  }

  // 2. QUERY CACHING
  if (owner && repo) {
    const cachedSelection = await getCachedQuerySelection(owner, repo, question);
    if (cachedSelection) {
      console.log("🧠 Query Cache Hit:", question);
      return cachedSelection;
    }
  }

  // 3. AI SELECTION
  const prompt = `
    Select relevant files for this query from the list below.
    Query: "${question}"
    
    Files:
    ${fileTree.slice(0, 1000).join("\n")}
    
    Rules:
    - Return JSON: { "files": ["path/to/file"] }
    - Max 50 files.
    - Select the MINIMUM number of files necessary to answer the query.
    - CRITICAL: Prioritize source code files (ts, js, py, etc.) over documentation (md) for technical queries.
    - Only pick README.md if the query is about "what is this repo", "installation", or high-level features.
    - For "how does this work" or "logic" queries, MUST select the actual source code files.
    - NO EXPLANATION. JSON ONLY.
    `;

  try {
    const result = await safeGenerateContent(prompt);
    const response = result.response.text();
    const cleanResponse = response.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);

    const selectedFiles = parsed.files || [];

    if (owner && repo && selectedFiles.length > 0) {
      await cacheQuerySelection(owner, repo, question, selectedFiles);
    }

    return selectedFiles;
  } catch (e) {
    console.error("Failed to parse file selection", e);
    return fileTree.filter(f => f === "README.md" || f === "package.json");
  }
}

export async function answerWithContext(
  question: string,
  context: string,
  repoDetails: { owner: string; repo: string },
  profileData?: any,
  history: { role: "user" | "model"; content: string }[] = [],
  selectedModel?: string
): Promise<string> {
  const historyText = history.map(msg => `${msg.role === "user" ? "User" : "RepoInfo"}: ${msg.content}`).join("\n\n");

  const prompt = `
    You are a specialized coding assistant called "RepoInfo".
    
    SYSTEM IDENTITY:
    Model is KAT-Coder-Pro from KwaiPilot (via OpenRouter), integrated by Rohit kumar.
    
    CURRENT REPOSITORY:
    - Owner: ${repoDetails.owner}
    - Repo: ${repoDetails.repo}
    - URL: https://github.com/${repoDetails.owner}/${repoDetails.repo}
    
    INSTRUCTIONS:
     A. **PERSONA & TONE**:
        - **Identity**: You are "RepoInfo", an expert AI software engineer.
        - **Professionalism**: For technical questions, be precise, helpful, and strictly factual.
        - **WIT & SARCASM**: If the user is being witty, sarcastic, or playful, **MATCH THEIR ENERGY**.
        - **Conciseness**: Be brief. Do not waffle.
        - **SOURCE OF TRUTH**: Trust code over docs. If README conflicts with code, trust the code.
        - **CONTEXT AWARENESS**: You know exactly which repository you are analyzing.

     B. **GENERATION TASKS**:
        - **ACTION**: You MUST generate the content.
        - **MISSING FILES**: If a file is missing, write it from scratch based on other files.
        - **FORMATTING RULES**: 
         - Use ### headers for sections
         - Use bullet points (-) for explanations
         - Bold **key concepts** and **file names**
         - Use backticks for code references
         - Add blank lines before/after lists

     C. **FACTUAL QUESTIONS**:
        - Answer strictly based on context.
        - If info missing: "I cannot find the answer to this in the selected files."

     D. **INTERACTIVE CARDS**:
        Repository cards: :::repo-card ... :::
        Developer cards: :::developer-card ... :::

      E. **RESPONSE STRUCTURE**:
         - For file generation: Provide FULL CONTENT in code blocks
         - For diagrams: Use mermaid-json format
         - Combine elements when appropriate

    CONTEXT FROM REPOSITORY:
    ${context}

    CONVERSATION HISTORY:
    ${historyText}

    USER QUESTION:
    ${question}

    Answer:
    `;

  const result = await safeGenerateContent(prompt, selectedModel);
  return result.response.text();
}

export async function* answerWithContextStream(
  question: string,
  context: string,
  repoDetails: { owner: string; repo: string },
  profileData?: any,
  history: { role: "user" | "model"; content: string }[] = [],
  selectedModel?: string
): AsyncGenerator<string> {
  const historyText = history.map(msg => `${msg.role === "user" ? "User" : "RepoInfo"}: ${msg.content}`).join("\n\n");

  const prompt = `
    You are a specialized coding assistant called "RepoInfo".
    
    SYSTEM IDENTITY:
    Model is KAT-Coder-Pro from KwaiPilot (via OpenRouter), integrated by Rohit kumar.
    
    CURRENT REPOSITORY:
    - Owner: ${repoDetails.owner}
    - Repo: ${repoDetails.repo}
    - URL: https://github.com/${repoDetails.owner}/${repoDetails.repo}

    [... same instructions as above ...]

    CONTEXT FROM REPOSITORY:
    ${context}

    CONVERSATION HISTORY:
    ${historyText}

    USER QUESTION:
    ${question}

    Answer:
  `;

  const result = await safeGenerateContentStream(prompt, selectedModel);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

export async function fixMermaidSyntax(code: string): Promise<string | null> {
  try {
    const prompt = `You are a Mermaid diagram syntax expert. Fix the following Mermaid diagram code to make it valid.

CRITICAL RULES:
1. Node labels MUST be in double quotes inside brackets: A["Label Text"]
2. Remove quotes, backticks, HTML tags from inside node labels
3. Edge labels should NOT be quoted: A -- label text --> B
4. Every node after an arrow must have an ID and shape
5. Only use alphanumeric characters, spaces, and basic punctuation in labels

INVALID MERMAID CODE:
\`\`\`mermaid
${code}
\`\`\`

Return ONLY the corrected Mermaid code in a markdown code block:
\`\`\`mermaid
[corrected code here]
\`\`\``;

    const result = await safeGenerateContent(prompt);
    const response = result.response.text();

    const match = response.match(/```mermaid\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return match[1].trim();
    }

    return null;
  } catch (error) {
    console.error('AI Mermaid fix failed:', error);
    return null;
  }
}
