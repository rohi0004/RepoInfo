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
        id: 'openrouter/free',
        name: 'Free Models Router',
        provider: 'OpenRouter',
        contextWindow: '200K context',
        description: 'Routes requests across the free OpenRouter pool based on availability and capability',
        bestFor: ['Free Inference', 'General Use', 'Auto Selection'],
        category: 'general',
    },
];

export const DEFAULT_MODEL = 'openrouter/free';

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
