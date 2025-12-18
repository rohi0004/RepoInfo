"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Sparkles, Zap, Brain, Activity } from "lucide-react";
import { AI_MODELS, getSelectedModel, saveSelectedModel, type AIModel } from "@/lib/models";
import { motion, AnimatePresence } from "framer-motion";

interface ModelSelectorProps {
    onModelChange?: (modelId: string) => void;
    compact?: boolean;
}

const categoryIcons = {
    coding: Brain,
    general: Activity,
    reasoning: Sparkles,
    fast: Zap,
};

const categoryColors = {
    coding: 'text-purple-500',
    general: 'text-blue-500',
    reasoning: 'text-yellow-500',
    fast: 'text-green-500',
};

export function ModelSelector({ onModelChange, compact = false }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedModel(getSelectedModel());
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleModelSelect = (modelId: string) => {
        setSelectedModel(modelId);
        saveSelectedModel(modelId);
        setIsOpen(false);
        onModelChange?.(modelId);
    };

    const currentModel = AI_MODELS.find(m => m.id === selectedModel);
    const Icon = currentModel ? categoryIcons[currentModel.category] : Brain;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 sm:gap-2 ${compact ? 'px-2 py-1' : 'px-2 sm:px-3 py-1.5 sm:py-2'} rounded-lg transition-all text-xs hover:opacity-80`}
                style={{
                    background: compact ? 'transparent' : 'var(--surface)',
                    border: compact ? 'none' : '1px solid var(--border)',
                    color: 'var(--foreground)'
                }}
            >
                <Icon className={`w-3.5 h-3.5 ${currentModel ? categoryColors[currentModel.category] : 'text-purple-500'}`} />
                <span className="font-medium truncate max-w-[80px] sm:max-w-[120px]">
                    {currentModel?.name || 'Select Model'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 bottom-full mb-2 w-[280px] sm:w-[400px] max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl z-50 border"
                        style={{
                            background: 'var(--surface)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        <div className="p-3 border-b sticky top-0 z-10"
                            style={{
                                background: 'var(--surface)',
                                borderColor: 'var(--border)'
                            }}
                        >
                            <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                                Select AI Model
                            </h3>
                            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                All models are free via OpenRouter
                            </p>
                        </div>

                        <div className="p-2">
                            {AI_MODELS.map((model) => {
                                const ModelIcon = categoryIcons[model.category];
                                const isSelected = model.id === selectedModel;

                                return (
                                    <button
                                        key={model.id}
                                        onClick={() => handleModelSelect(model.id)}
                                        className="w-full text-left p-3 rounded-lg transition-all hover:opacity-80 mb-1"
                                        style={{
                                            background: isSelected ? 'var(--accent)' : 'transparent',
                                            color: isSelected ? '#fff' : 'var(--foreground)'
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <ModelIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : categoryColors[model.category]}`} />
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm truncate">
                                                        {model.name}
                                                    </span>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 flex-shrink-0" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs opacity-80">
                                                        {model.provider}
                                                    </span>
                                                    <span className="text-xs opacity-60">
                                                        • {model.contextWindow}
                                                    </span>
                                                </div>
                                                
                                                <p className="text-xs opacity-70 mb-2 line-clamp-2">
                                                    {model.description}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-1">
                                                    {model.bestFor.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                                            style={{
                                                                background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                                                                color: isSelected ? '#fff' : 'var(--muted)'
                                                            }}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-3 border-t text-xs"
                            style={{
                                borderColor: 'var(--border)',
                                color: 'var(--muted)'
                            }}
                        >
                            💡 Tip: Different models excel at different tasks. Try them!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
