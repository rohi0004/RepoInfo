import { useRef, useEffect, useState } from "react";
import { Send, FileCode, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelector } from "./ModelSelector";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    fileTree?: any[];
    onFileSelect?: (filePath: string) => void;
    selectedFiles?: string[];
    onRemoveFile?: (filePath: string) => void;
    onModelChange?: (modelId: string) => void;
}

export function ChatInput({ value, onChange, onSubmit, placeholder, disabled, loading, fileTree = [], onFileSelect, selectedFiles = [], onRemoveFile, onModelChange }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showFileSuggestions, setShowFileSuggestions] = useState(false);
    const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(pointer: coarse)').matches);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // File suggestion logic
    useEffect(() => {
        const text = value;
        const lastSlashIndex = text.lastIndexOf('/');
        
        if (lastSlashIndex !== -1) {
            const afterSlash = text.slice(lastSlashIndex + 1);
            const beforeSlash = text.slice(0, lastSlashIndex);
            
            // Check if this looks like a file command (not a URL)
            const isFileCommand = !beforeSlash.includes('http') && !beforeSlash.includes('://') && 
                                 (lastSlashIndex === 0 || text[lastSlashIndex - 1] === ' ' || lastSlashIndex === text.length - 1 || afterSlash.length > 0);
            
            if (isFileCommand && fileTree.length > 0) {
                const searchTerm = afterSlash.toLowerCase();
                const matches = fileTree
                    .filter((f: any) => {
                        const fileName = f.path.split('/').pop().toLowerCase();
                        const fullPath = f.path.toLowerCase();
                        return fileName.includes(searchTerm) || fullPath.includes(searchTerm);
                    })
                    .slice(0, 10);
                
                setFilteredFiles(matches);
                setShowFileSuggestions(matches.length > 0);
                setSelectedIndex(0);
            } else {
                setShowFileSuggestions(false);
            }
        } else {
            setShowFileSuggestions(false);
        }
    }, [value, fileTree]);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const newHeight = Math.min(textarea.scrollHeight, 200);
            textarea.style.height = `${newHeight}px`;

            // Only show scrollbar if content exceeds max height
            if (textarea.scrollHeight > 200) {
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.overflowY = 'hidden';
            }
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (showFileSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredFiles.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (filteredFiles[selectedIndex]) {
                    handleFileSelect(filteredFiles[selectedIndex].path);
                }
                return;
            } else if (e.key === 'Escape') {
                setShowFileSuggestions(false);
            }
        } else if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    const handleFileSelect = (filePath: string) => {
        // Remove the /filename from input after selecting
        const lastSlashIndex = value.lastIndexOf('/');
        const newValue = lastSlashIndex !== -1 ? value.slice(0, lastSlashIndex).trim() : value.trim();
        onChange(newValue);
        setShowFileSuggestions(false);
        if (onFileSelect) {
            onFileSelect(filePath);
        }
        textareaRef.current?.focus();
    };

    return (
        <div className="relative">
            {/* File Suggestions Dropdown */}
            {showFileSuggestions && filteredFiles.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 right-0 mb-2 rounded-lg shadow-lg overflow-hidden border z-50"
                    style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="p-2 text-xs font-medium" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                        Select a file (↑↓ to navigate, Enter to select)
                    </div>
                    {filteredFiles.map((file, index) => (
                        <button
                            key={file.path}
                            onClick={() => handleFileSelect(file.path)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
                                index === selectedIndex && "bg-opacity-10"
                            )}
                            style={{
                                background: index === selectedIndex ? 'var(--accent)' : 'transparent',
                                color: index === selectedIndex ? 'var(--foreground)' : 'var(--muted)',
                                opacity: index === selectedIndex ? 1 : 0.8
                            }}
                        >
                            <FileCode className="w-4 h-4 shrink-0" />
                            <span className="truncate font-mono">{file.path}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Input Container with Tags */}
            <div 
                className={cn(
                    "w-full rounded-xl px-4 py-3 pr-12 focus-within:ring-2 transition-all min-h-[56px]",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                }}
            >
                {/* Model Selector and File Tags Row */}
                <div className="flex items-center gap-2 mb-2">
                    {/* Model Selector */}
                    {onModelChange && (
                        <div className="shrink-0">
                            <ModelSelector onModelChange={onModelChange} compact />
                        </div>
                    )}
                    
                    {/* Selected Files Tags */}
                    {selectedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((filePath) => (
                            <div
                                key={filePath}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors"
                                style={{
                                    background: '#10b981',
                                    color: '#fff',
                                }}
                            >
                                <FileCode className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[150px] sm:max-w-[250px]">{filePath}</span>
                                {onRemoveFile && (
                                    <button
                                        onClick={() => onRemoveFile(filePath)}
                                        className="hover:bg-white/20 rounded p-0.5 transition-colors"
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            ))}
                        </div>
                    )}
                </div>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        "w-full bg-transparent focus:outline-none resize-none min-h-[24px] max-h-[150px]",
                        disabled && "cursor-not-allowed"
                    )}
                    style={{
                        color: 'var(--foreground)',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--border) transparent',
                        overflowY: 'hidden'
                    }}
                />
            </div>
            
            <button
                type="submit"
                disabled={!value.trim() || loading || disabled}
                className="absolute right-3 bottom-3 p-2 transition-colors disabled:opacity-50"
                style={{ color: 'var(--accent)' }}
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
    );
}
