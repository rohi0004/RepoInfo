// import { parse } from '@babel/parser';
// import traverseModule from '@babel/traverse';
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// const traverse = traverseModule.default || traverseModule;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
const deepSeek = deepSeekApiKey ? new OpenAI({
    apiKey: deepSeekApiKey,
    baseURL: "https://api.deepseek.com/v1",
}) : null;

export interface QualityMetrics {
    complexity: number;
    maintainability: number; // 0-100
    loc: number;
    functionCount: number;
}

export interface CodeIssue {
    type: 'complexity' | 'style' | 'potential_bug' | 'best_practice';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    line: number;
    suggestion: string;
}

export interface QualityReport {
    metrics: QualityMetrics;
    issues: CodeIssue[];
    score: number; // 0-100
    summary: string;
}

/**
 * Calculate Cyclomatic Complexity using simple heuristics
 * (Babel AST parsing disabled - install @babel/parser and @babel/traverse to enable)
 */
function calculateComplexity(code: string): number {
    try {
        // Simple heuristic-based complexity calculation
        let complexity = 1;
        const lines = code.split('\n');
        
        for (const line of lines) {
            // Count control flow keywords
            if (/\b(if|else if|for|while|do|switch|catch|case)\b/.test(line)) {
                complexity++;
            }
            // Count logical operators
            if (/(\|\||&&)/.test(line)) {
                complexity++;
            }
            // Count ternary operators
            if (/\?.*:/.test(line)) {
                complexity++;
            }
        }

        return complexity;
    } catch (e) {
        console.warn('Complexity calculation failed:', e);
        return 1;
    }
}

/**
 * Analyze code quality using AST metrics + Gemini AI
 */
export async function analyzeCodeQuality(
    code: string,
    filename: string
): Promise<QualityReport> {
    // 1. Calculate Static Metrics
    const complexity = calculateComplexity(code);
    const loc = code.split('\n').length;
    const functionCount = (code.match(/function\s+\w+|=>|\w+\s*\([^)]*\)\s*\{/g) || []).length;

    // Simple maintainability index approximation
    // MI = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
    // Simplified: 100 - (complexity * 2) - (loc / 20)
    const maintainability = Math.max(0, Math.min(100, 100 - (complexity * 1.5) - (loc / 50)));

    const metrics: QualityMetrics = {
        complexity,
        maintainability: Math.round(maintainability),
        loc,
        functionCount
    };

    // 2. AI Qualitative Analysis (Zero-Cost Linter)
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

        const prompt = `
      You are a senior code reviewer. Analyze this code file (${filename}) for quality issues.
      
      Metrics Context:
      - Cyclomatic Complexity: ${complexity} (High if > 10)
      - Lines of Code: ${loc}
      
      Code:
      \`\`\`${filename.split('.').pop()}
      ${code.slice(0, 8000)}
      \`\`\`
      
      Provide a JSON response with:
      1. A quality score (0-100)
      2. A brief summary (max 2 sentences)
      3. A list of specific issues (max 5) with line numbers, severity, and suggestions.
      
      Format:
      {
        "score": number,
        "summary": "string",
        "issues": [
          { "type": "complexity"|"style"|"potential_bug"|"best_practice", "severity": "critical"|"high"|"medium"|"low", "message": "string", "line": number, "suggestion": "string" }
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const aiReport = JSON.parse(jsonMatch[0]);
            return {
                metrics,
                score: aiReport.score,
                summary: aiReport.summary,
                issues: aiReport.issues
            };
        }
    } catch (error) {
        console.error('Gemini AI analysis failed:', error);
        // Try DeepSeek as fallback
        if (deepSeek) {
            try {
                const messages: OpenAI.ChatCompletionMessageParam[] = [
                    {
                        role: "user",
                        content: `
      You are a senior code reviewer. Analyze this code file (${filename}) for quality issues.
      
      Metrics Context:
      - Cyclomatic Complexity: ${complexity} (High if > 10)
      - Lines of Code: ${loc}
      
      Code:
      \`\`\`${filename.split('.').pop()}
      ${code.slice(0, 8000)}
      \`\`\`
      
      Provide a JSON response with:
      1. A quality score (0-100)
      2. A brief summary (max 2 sentences)
      3. A list of specific issues (max 5) with line numbers, severity, and suggestions.
      
      Format:
      {
        "score": number,
        "summary": "string",
        "issues": [
          { "type": "complexity"|"style"|"potential_bug"|"best_practice", "severity": "critical"|"high"|"medium"|"low", "message": "string", "line": number, "suggestion": "string" }
        ]
      }
    `
                    }
                ];

                const completion = await deepSeek.chat.completions.create({
                    model: "deepseek-chat",
                    messages,
                    temperature: 0.3,
                    max_tokens: 2000,
                });

                const text = completion.choices[0].message.content;
                const jsonMatch = text?.match(/\{[\s\S]*\}/);

                if (jsonMatch) {
                    const aiReport = JSON.parse(jsonMatch[0]);
                    return {
                        metrics,
                        score: aiReport.score,
                        summary: aiReport.summary,
                        issues: aiReport.issues
                    };
                }
            } catch (deepSeekError) {
                console.error('DeepSeek AI analysis also failed:', deepSeekError);
            }
        } else {
            console.warn('DeepSeek API key not configured, skipping fallback analysis');
        }
    }

    // Fallback if AI fails
    return {
        metrics,
        score: Math.round(maintainability),
        summary: `Static analysis shows complexity of ${complexity} and ${loc} lines of code.`,
        issues: complexity > 10 ? [{
            type: 'complexity',
            severity: 'medium',
            message: 'High cyclomatic complexity detected',
            line: 1,
            suggestion: 'Consider breaking down complex functions'
        }] : []
    };
}
