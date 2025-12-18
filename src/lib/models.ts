/**
 * Available AI models for RepoInfo
 * All models are free from OpenRouter
 */

export interface AIModel {
    id: string;
    name: string;
    provider: string;
    contextWindow: string;
    description: string;
    bestFor: string[];
    category: 'coding' | 'general' | 'reasoning' | 'fast';
}

export const AI_MODELS: AIModel[] = [
    {
        id: 'kwaipilot/kat-coder-pro:free',
        name: 'KAT-Coder-Pro',
        provider: 'Kwaipilot',
        contextWindow: '97.2B tokens',
        description: 'Advanced agentic coding model optimized for software engineering tasks',
        bestFor: ['Code Analysis', 'Architecture', 'Refactoring'],
        category: 'coding',
    },
    {
        id: 'google/gemini-2.0-flash-exp:free',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        contextWindow: '1.48B tokens',
        description: 'Significantly faster TTFT with quality on par with larger models',
        bestFor: ['Fast Responses', 'General Queries', 'Quick Analysis'],
        category: 'fast',
    },
    {
        id: 'qwen/qwen3-4b:free',
        name: 'Qwen3 4B',
        provider: 'Qwen',
        contextWindow: '50.8M tokens',
        description: '4B parameter model designed for reasoning-intensive tasks',
        bestFor: ['Reasoning', 'Problem Solving', 'Logic'],
        category: 'reasoning',
    },
    {
        id: 'nvidia/nemotron-3-30b-a3b:free',
        name: 'Nemotron 3 Nano 30B',
        provider: 'NVIDIA',
        contextWindow: '9.21B tokens',
        description: 'Small MoE model with high compute efficiency for specialized AI systems',
        bestFor: ['Translation', 'Efficiency', 'Accuracy'],
        category: 'general',
    },
    {
        id: 'openai/gpt-oss-120b:free',
        name: 'GPT-OSS-120B',
        provider: 'OpenAI',
        contextWindow: '560M tokens',
        description: 'Open-weight MoE model for high-reasoning and production use cases',
        bestFor: ['Production', 'Reasoning', 'General Purpose'],
        category: 'reasoning',
    },
    {
        id: 'openai/gpt-oss-20b:free',
        name: 'GPT-OSS-20B',
        provider: 'OpenAI',
        contextWindow: '3.68B tokens',
        description: 'Open-weight 21B parameter MoE model with 3.6B active parameters',
        bestFor: ['General Tasks', 'Efficiency', 'Balanced Performance'],
        category: 'general',
    },
    {
        id: 'google/gemma-3n-4b:free',
        name: 'Gemma 3n 4B',
        provider: 'Google',
        contextWindow: '41.2M tokens',
        description: 'Optimized for mobile and low-resource devices with multimodal inputs',
        bestFor: ['Mobile', 'Efficiency', 'Multimodal'],
        category: 'fast',
    },
    {
        id: 'nvidia/nemotron-nano-9b-v2:free',
        name: 'Nemotron Nano 9B V2',
        provider: 'NVIDIA',
        contextWindow: '363M tokens',
        description: 'Large language model for reasoning and non-reasoning tasks',
        bestFor: ['Reasoning', 'User Queries', 'Versatility'],
        category: 'reasoning',
    },
    {
        id: 'nvidia/nemotron-nano-12b-2vl:free',
        name: 'Nemotron Nano 12B 2VL',
        provider: 'NVIDIA',
        contextWindow: '49.1B tokens',
        description: '12B parameter multimodal reasoning model for video and document understanding',
        bestFor: ['Multimodal', 'Video', 'Documents'],
        category: 'reasoning',
    },
    {
        id: 'mistralai/mistral-small-3.1-24b:free',
        name: 'Mistral Small 3.1 24B',
        provider: 'Mistral',
        contextWindow: '172M tokens',
        description: 'Upgraded variant with 24B parameters and advanced multimodal capabilities',
        bestFor: ['Multimodal', 'State-of-the-art', 'Performance'],
        category: 'general',
    },
    {
        id: 'arcee-ai/trinity-mini:free',
        name: 'Trinity Mini',
        provider: 'Arcee AI',
        contextWindow: '361M tokens',
        description: '26B parameter sparse MoE model with 8 experts for efficient reasoning',
        bestFor: ['Long Context', 'Efficiency', 'Reasoning'],
        category: 'reasoning',
    },
    {
        id: 'venice/uncensored:free',
        name: 'Venice Uncensored',
        provider: 'Venice',
        contextWindow: '626M tokens',
        description: 'Fine-tuned variant of Mistral-Small designed for uncensored responses',
        bestFor: ['Uncensored', 'Creative', 'Open Discussions'],
        category: 'general',
    },
];

export const DEFAULT_MODEL = 'kwaipilot/kat-coder-pro:free';

export function getModelById(id: string): AIModel | undefined {
    return AI_MODELS.find(model => model.id === id);
}

export function getModelsByCategory(category: AIModel['category']): AIModel[] {
    return AI_MODELS.filter(model => model.category === category);
}

export function saveSelectedModel(modelId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('selected_ai_model', modelId);
    }
}

export function getSelectedModel(): string {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('selected_ai_model') || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
}
